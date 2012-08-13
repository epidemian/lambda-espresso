# λ calculus parser

# A custom Jison parser.
parser = new (require './grammar').Parser

# Add some handy functions so the parser can build the AST nodes.
parser.yy =
  parseAbstraction: (varList, body) ->
    i = varList.length
    body = new AbsNode varList[i], body while i--
    body
  parseApplication: (left, right) ->
    new ApplyNode left, right
  parseVariable: (name) ->
    new VarNode name

# A useful function to trace some method's execution.
Function::trace = do ->
  traceEnabled = no

  # Global indentation level.
  indent = 0

  # Log indented messages.
  log = (msg) ->
    ind = ''
    for i in [0...indent] then ind += '| '
    console.log "#{ind}#{msg}"

  makeTracing = (name, fn) ->
    (args...) ->
      log "(#{@}).#{name}(#{args.join ', '})"
      indent++
      res = fn.apply @, args
      indent--
      log "-> #{res}"
      res

  (arg) ->
    for own name, fn of arg
      @prototype[name] = if traceEnabled then makeTracing name, fn else fn

# Utility functions:
removeAll = (arr, x) ->
  y for y in arr when y isnt x

print = (obj) ->
  console.log JSON.stringify obj, null, 2

class Node
  leftApplyString: -> '' + @
  rightApplyString: -> '' + @
  toJSON: ->
    [@constructor.name].concat (v for own k, v of @)

class VarNode extends Node
  constructor: (@name) ->
  toString: -> @name
  reduce: -> @
  apply: -> no
  replace: (varName, node) ->
    if varName is @name then node else @
  freeVars: -> [@name]

class AbsNode extends Node
  constructor: (@varName, @body) ->
  toString: -> "λ#{@varName}.#{@body}"
  leftApplyString: -> "(#{@})"
  @trace reduce: ->
    new AbsNode @varName, @body.reduce()
  @trace apply: (node) ->
    @body.replace @varName, node
  # TODO Renaming is not correct as of now. Consider the case:
  # (λy.λy1.x y y1)[x := y z]
  # (λy.λy1.x y y1) must be alpha-renamed because y is free on (y z) and x is
  # free on (x y y1). The current algorithm now chooses to rename y to y1, but
  # is invalid, because it'll make the y variable, free in (λy1.x y y1) be bound
  # to a new abstraction.
  @trace replace: (varName, node) ->
    # The parameter of this abstraction makes a new context, so no replacement
    # is needed.
    return @ if varName is @varName
    # Avoid name collisions by renaming the @varName if it conflicts with any of
    # the node's free vars.
    freeVars = node.freeVars()
    if @varName in freeVars
      (@renameVar freeVars).replace varName, node
    else
      new AbsNode @varName, @body.replace varName, node

  renameVar: (freeVars) ->
    # The the letters part of the var in case it's an already renamed var.
    base = @varName.replace /\d+/, ''
    n = 1
    name = base
    while name in freeVars
      name = base + n++
    # A new AbsNode with the new name and the body with the renamed var.
    new AbsNode name, (@body.replace @varName, new VarNode name)

  freeVars: ->
    removeAll @body.freeVars(), @varName

class ApplyNode extends Node
  constructor: (@left, @right) ->
  toString: ->
    "#{@left.leftApplyString()} #{@right.rightApplyString()}"
  rightApplyString: -> "(#{@})"
  @trace reduce: ->
    leftReduced = @left.reduce()
    rightReduced = @right.reduce()
    (leftReduced.apply rightReduced) or new ApplyNode leftReduced, rightReduced
  @trace apply: -> no
  @trace replace: (varName, node) ->
    new ApplyNode (@left.replace varName, node), (@right.replace varName, node)
  freeVars: ->
    @left.freeVars().concat @right.freeVars()

# Global namespace.
Lambda = exports ? (@Lambda = {})

Lambda.parse = (expr) ->
  (parser.parse expr).toString()

Lambda.reduce = (expr) ->
  (parser.parse expr).reduce().toString()

#print (Lambda.parse '(λx.λy.x z y x) y b').reduce().toString()
#print (Lambda.parse '(λx.λy.(λz.λy.z y) (x y)) y').reduce().toString()
#Lambda.printAst 'λx y z. y z'
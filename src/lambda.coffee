# λ calculus parser

# A custom Jison parser.
parser = new (require './grammar').Parser

# Add some handy functions so the parser can build the AST nodes.
parser.yy =
  parseAbstraction: (varName, body) -> new AbsNode varName, body
  parseApplication: (left, right) -> new ApplyNode left, right
  parseVariable: (name) -> new VarNode name

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
  hasFree: (varName) -> @name is varName
  varRenameCollides: -> no

class AbsNode extends Node
  constructor: (@varName, @body) ->
  toString: -> "λ#{@varName}.#{@body}"
  leftApplyString: -> "(#{@})"
  @trace reduce: ->
    new AbsNode @varName, @body.reduce()
  @trace apply: (node) ->
    @body.replace @varName, node

  @trace replace: (varName, node) ->
    # (λx.T)[x := S] = λx.T
    # (λx creates a new context for x so no firther substitution is needed)
    return @ if varName is @varName
    # (λy.T)[x := S] with x != y
    # if y is free in S and x is free in T, then must α-convert λy.T to avoid
    # name conflicts.
    if (node.hasFree @varName) and (@body.hasFree varName)
      # (λy.T)[x := S] = ((λy.T)[y := y'])[y' := S]
      (@renameVar node).replace varName, node
    else
      # (λy.T)[x := S] = λy.(T[x := S])
      new AbsNode @varName, @body.replace varName, node

  renameVar: (substitutionNode) ->
    # Split the name into base and number part.
    base = @varName.replace /\d+$/, ''
    n = if m = @varName.match /\d+$/ then parseInt m[0] else 0

    until name and validName
      name = base + ++n
      validName = not (substitutionNode.hasFree name) and # Avoid name collisions with substitution term.
        not (@body.hasFree name) and # Avoid name collisions with free variables in body.
        not (@body.varRenameCollides @varName, name) # Avoid name collisions with inner abstractions.

    # A new AbsNode with the new name and the body with the renamed var.
    new AbsNode name, (@body.replace @varName, new VarNode name)

  hasFree: (varName) ->
    varName isnt @varName and @body.hasFree varName

  varRenameCollides: (from, to) ->
    # A variable rename collides with this abstraction if the former variable
    # vas free in this context and the new name for the variable is the same as
    # the varName in the abstraction, thus changing old free variable binding.
    ((@hasFree from) and @varName is to) or (@body.varRenameCollides from, to)

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
  hasFree: (varName) ->
    (@left.hasFree varName) or (@right.hasFree varName)
  varRenameCollides: (from, to) ->
    (@left.varRenameCollides from, to) or (@right.varRenameCollides from, to)

# Global namespace.
Lambda = exports ? (@Lambda = {})

Lambda.parse = (expr) ->
  (parser.parse expr).toString()

Lambda.reduce = (expr) ->
  (parser.parse expr).reduce().toString()

#print (Lambda.parse '(λx.λy.x z y x) y b').reduce().toString()
#print (Lambda.parse '(λx.λy.(λz.λy.z y) (x y)) y').reduce().toString()
#Lambda.printAst 'λx y z. y z'
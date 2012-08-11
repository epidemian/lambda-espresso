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
  # Global indentation level.
  indent = 0

  # Log indented messages.
  log = (msg) ->
    ind = ''
    for i in [0...indent] then ind += '  '
    console.log "#{ind}#{msg}"

  (arg) ->
    for own name, fn of arg
      @prototype[name] = (args...) ->
        log "(#{@}).#{name}(#{args.join ', '})"
        indent++
        res = fn.apply @, args
        indent--
        log "-> #{res}"
        res

class Node
  leftApplyString: -> '' + @
  rightApplyString: -> '' + @
  toJSON: ->
    [@constructor.name].concat (v for own k, v of @)

class VarNode extends Node
  constructor: (@name) ->
  toString: -> @name
  @trace reduce: -> @
  @trace apply: -> no
  @trace replace: (varName, node) ->
    if varName is @name
      node
    else
      @

class AbsNode extends Node
  constructor: (@varName, @body) ->
  toString: -> "λ#{@varName}.#{@body}"
  leftApplyString: -> "(#{@})"
  @trace reduce: ->
    new AbsNode @varName, @body.reduce()
  @trace apply: (node) ->
    @body.replace @varName, node
  @trace replace: (varName, node) -> # (\x.\z.x z) \y.y z
    if varName is @varName
      # The parameter of this abstraction makes a new context, so no replacement
      # is needed.
      @
    else
      new AbsNode @varName, @body.replace varName, node

class ApplyNode extends Node
  constructor: (@left, @right) ->
  toString: ->
    "#{@left.leftApplyString()} #{@right.rightApplyString()}"
  rightApplyString: -> "(#{@})"
  @trace reduce: ->
    left = @left.reduce()
    left.apply(@right) or new ApplyNode left, @right.reduce()
  @trace apply: -> no
  @trace replace: (varName, node) ->
    new ApplyNode (@left.replace varName, node), (@right.replace varName, node)

# Global namespace.
Lambda = exports ? (@Lambda = {})

Lambda.parse = (expr) ->
  parser.parse expr

Lambda.printAst = (expr) ->
  nodes = parser.parse expr
  console.log JSON.stringify nodes, null, 2

console.log (Lambda.parse '(λx.λy.x y x) y b').reduce().toString()
#Lambda.printAst 'λx y z. y z'

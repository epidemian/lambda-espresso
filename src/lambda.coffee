# λ calculus parser

# Parses an input program string and returns a list of terms to be reduced.
parse = (str) ->
  # A custom Jison parser.
  parser = new (require './grammar').Parser

  # A macro teble with the macros by their names.
  macros = {}
  # The terms of the program.
  terms = []

  # Add some handy functions so the parser can build the AST.
  parser.yy =
    parseAbstraction: (varName, body) -> new Abstraction varName, body
    parseApplication: (left, right) -> new Application left, right
    parseVariable: (name) -> new Variable name
    parseMacroDefinition: (name, term) ->
      console.log 'macro def', name, term
      throw "#{name} already defined" if macros[name]
      macros[name] = term
    parseMacroUsage: (name) ->
      console.log 'macro usage', name
      throw "#{name} not defined" unless name
      macros[name]
    parseTermEvaluation: (term) -> terms.push term
    getProgram: -> terms

  parser.parse str

# An abstract λ calculus term.
class Term
  leftApplyString: -> '' + @
  rightApplyString: -> '' + @
  toJSON: ->
    [@constructor.name].concat (v for own k, v of @)

class Variable extends Term
  constructor: (@name) ->
  toString: -> @name
  reduceStep: -> null # Variables cannot be reduced.
  applyStep: -> null # Nor applied.
  replace: (varName, term) ->
    # x[x := T] = T, y[x := T] = y
    if varName is @name then term else @
  hasFree: (varName) -> @name is varName
  varRenameCollides: -> no

class Abstraction extends Term
  constructor: (@varName, @body) ->
  toString: -> "λ#{@varName}.#{@body}"
  leftApplyString: -> "(#{@})"
  reduceStep: ->
    reducedBody = @body.reduceStep()
    reducedBody and new Abstraction @varName, reducedBody
  applyStep: (term) ->
    @body.replace @varName, term

  replace: (varName, term) ->
    # (λx.T)[x := S] = λx.T
    # (λx creates a new context for x so no firther substitution is needed)
    return @ if varName is @varName
    # (λy.T)[x := S] with x != y
    # if y is free in S and x is free in T, then must α-convert λy.T to avoid
    # name conflicts.
    if (term.hasFree @varName) and (@body.hasFree varName)
      # (λy.T)[x := S] = ((λy.T)[y := y'])[y' := S]
      (@renameVar term).replace varName, term
    else
      # (λy.T)[x := S] = λy.(T[x := S])
      new Abstraction @varName, @body.replace varName, term

  renameVar: (substitutionTerm) ->
    # Split the name into base and number part.
    base = @varName.replace /\d+$/, ''
    n = if m = @varName.match /\d+$/ then parseInt m[0] else 0

    until name and validName
      name = base + ++n
      validName =
        # Avoid name collisions with substitution term.
        not (substitutionTerm.hasFree name) and
        # Avoid name collisions with free variables in body.
        not (@body.hasFree name) and
        # Avoid name collisions with inner abstractions.
        not (@body.varRenameCollides @varName, name)

    # A new abstraction with the new name and the body with the renamed var.
    new Abstraction name, (@body.replace @varName, new Variable name)

  hasFree: (varName) ->
    varName isnt @varName and @body.hasFree varName

  varRenameCollides: (from, to) ->
    # A variable rename collides with this abstraction if the former variable
    # vas free in this context and the new name for the variable is the same as
    # the varName in the abstraction, thus changing old free variable binding.
    ((@hasFree from) and @varName is to) or (@body.varRenameCollides from, to)

class Application extends Term
  constructor: (@left, @right) ->
  toString: ->
    "#{@left.leftApplyString()} #{@right.rightApplyString()}"
  rightApplyString: -> "(#{@})"
  reduceStep: ->
    applied = @left.applyStep @right
    # An application step is a reduction step:
    return applied if applied

    # Reduce left one step; maybe next step it can be applied.
    reducedLeft = @left.reduceStep()
    return new Application reducedLeft, @right if reducedLeft

    # Left is irreducible; try reducing right.
    reducedRight = @right.reduceStep()
    reducedRight and new Application @left, reducedRight
  applyStep: -> null
  replace: (varName, term) ->
    # (T S)[x := R] = (T[x := R]) (S[x := R])
    new Application (@left.replace varName, term), (@right.replace varName, term)
  hasFree: (varName) ->
    (@left.hasFree varName) or (@right.hasFree varName)
  varRenameCollides: (from, to) ->
    (@left.varRenameCollides from, to) or (@right.varRenameCollides from, to)

# Reduces a term up to its normal form and returns an array with each step of
# the reduction.
reduceTerm = (term) ->
  steps = [term.toString()]
  maxSteps = 100
  while term = term.reduceStep()
    steps.push term.toString()
    throw 'Too many reduction steps' if steps.length > maxSteps
  steps

parseTerm = (str) ->
  terms = parse str
  throw "program has #{terms.length} terms" if terms.length isnt 1
  terms[0]

# Parse a program with only one term.
exports.parseTerm = (str) ->
  (parseTerm str).toString()

# Reduce a program with only one term.
exports.reduceTerm = (str) ->
  reduceTerm parseTerm str

# Reduce a program that might have multiple terms.
exports.reduceProgram = (expr) ->
  terms = parse expr
  reduceTerm term for term in terms
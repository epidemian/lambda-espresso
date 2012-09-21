# λ calculus parser
{repeatStr} = require './helpers'

# Term types. Uses classes only for pattern matching and destructuring.
class Variable    then constructor: (@name) ->
class Abstraction then constructor: (@varName, @body) ->
class Application then constructor: (@left, @right) ->
class Macro       then constructor: (@name, @term) ->

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
      throw Error "#{name} already defined" if macros[name]
      macros[name] = new Macro name, term
    parseMacroUsage: (name) ->
      throw Error "#{name} not defined" unless macros[name]
      macros[name]
    parseTermEvaluation: (term) -> terms.push term
    getProgram: -> terms

  parser.parse str

type = (t) -> t.constructor

# Returns the string representation for a given term t.
# l is the number of terms "at the left" of t and r the number of term "at the
# right"; they are used for parenthesization.
termStr = (t, l = 0, r = 0) ->
  switch type t
    when Variable, Macro
      t.name
    when Abstraction
      str = "λ#{t.varName}.#{termStr t.body}"
      str = "(#{str})" if r > 0
      str
    when Application
      str = "#{termStr t.left, l, r + 1} #{termStr t.right, l + 1, r}"
      str = "(#{str})" if l > 0
      str

# Print a given term in an tree format; intended for debugging purposes.
logTerm = (t, ind = 0) ->
  log = (msg) ->
    console.log (repeatStr '| ', ind) + msg
  switch type t
    when Variable, Macro
      log t.name
    when Abstraction
      log "λ#{t.varName}"
      logTerm t.body, ind + 1
    when Application
      log "@"
      logTerm t.left, ind + 1
      logTerm t.right, ind + 1

# Reduces term t by one step.
reduceStep = (t) ->
  switch type t
    when Variable
      # Variables cannot be reduced.
      null
    when Abstraction
      reducedBody = reduceStep t.body
      reducedBody and new Abstraction t.varName, reducedBody
    when Application
      applied = applyStep t.left, t.right
      # An application step is a reduction step:
      return applied if applied

      # Reduce left one step; maybe next step it can be applied.
      reducedLeft = reduceStep t.left
      return new Application reducedLeft, t.right if reducedLeft

      # Left is irreducible; try reducing right.
      reducedRight = reduceStep t.right
      reducedRight and new Application t.left, reducedRight
    when Macro
      # Only if the inner term can be reduced the macro is reduced, and the
      # reduction consists on substituting the macro with the actual term.
      (reduceStep t.term) and t.term

# Applies term s into term t.
applyStep = (t, s) ->
  switch type t
    when Variable, Application
      null
    when Abstraction
      substitute t.body, t.varName, s
    when Macro
      # Same logic as reduceStep. If the inner term can be applied, create a new
      # application as the macro expansion.
      (applyStep t.term, s) and new Application t.term, s

# Applies the substitution T[x := S]
# I.e., substitutes the variable x for the term S in the term T.
substitute = (t, x, s) ->
  switch type t
    when Variable
      # x[x := S] = S
      # y[x := S] = y
      if t.name is x then s else t
    when Abstraction
      # (λx.E)[x := S] = λx.E
      # (λx creates a new context for x so no further substitution is needed)
      return t if t.varName is x
      # (λy.E)[x := S] with x != y
      # if y is free in S and x is free in E, then must α-convert λy.E to avoid
      # name conflicts.
      if (isFree t.varName, s) and (isFree x, t.body)
        # (λy.E)[x := S] = ((λy.E)[y := y'])[y' := S]
        substitute (renameVar t, s), x, s
      else
        # (λy.E)[x := S] = λy.(E[x := S])
        new Abstraction t.varName, (substitute t.body, x, s)
    when Application
      # (U V)[x := S] = (U[x := S]) (V[x := S])
      new Application (substitute t.left, x, s), (substitute t.right, x, s)
    when Macro
      if isFree x, t.term
        throw Error "Logical error: #{x} is free in #{t.name}." +
          "Macros cannot have free variables"
      t

# Renames the variable of an abstraction to avoid naming conflicts when
# substituting
renameVar = (abstraction, t) ->
  {varName, body} = abstraction
  # Split the name into base and number part.
  base = varName.replace /\d+$/, ''
  n = if m = varName.match /\d+$/ then parseInt m[0] else 0

  until newName and isValid
    newName = base + ++n
    isValid =
      # Avoid name collisions with substitution term.
      not (isFree newName, t) and
      # Avoid name collisions with free variables in body.
      not (isFree newName, body) and
      # Avoid name collisions with inner abstractions.
      not (varRenameCollides body, varName, newName)

  # A new abstraction with the new name and the body with the renamed var.
  new Abstraction newName, (substitute body, varName, new Variable newName)

# Whether the variable x is free in the term t.
isFree = (x, t) ->
  switch type t
    when Variable
      t.name is x
    when Abstraction
      t.varName isnt x and isFree x, t.body
    when Application
      (isFree x, t.left) or (isFree x, t.right)
    when Macro
      isFree x, t.term

varRenameCollides = (t, oldName, newName) ->
  switch type t
    when Variable
      no
    when Abstraction
      # A variable rename collides with this abstraction if the old variable
      # was free in the abstraction and the new name for the variable is the
      # same as the varName of the abstraction, thus changing old free variable
      # binding.
      collisionHere = (isFree oldName, t) and t.varName is newName
      # Or if the renaming collides in the body of the abstraction...
      collisionHere or varRenameCollides t.body, oldName, newName
    when Application
      (varRenameCollides t.left, oldName, newName) or
      (varRenameCollides t.right, oldName, newName)
    when Macro
      varRenameCollides t.term, oldName, newName

# Reduces a term up to its normal form and returns an array with each step of
# the reduction.
reduceTerm = (term) ->
  steps = [termStr term]
  maxSteps = 100
  while term = reduceStep term
    steps.push termStr term
    throw Error 'Too many reduction steps' if steps.length > maxSteps
  steps

parseTerm = (str) ->
  terms = parse str
  throw Error "program has #{terms.length} terms" if terms.length isnt 1
  terms[0]

# Parse a program with only one term.
exports.parseTerm = (str) ->
  termStr parseTerm str

# Reduce a program with only one term.
exports.reduceTerm = (str) ->
  reduceTerm parseTerm str

# Reduce a program that might have multiple terms.
exports.reduceProgram = (expr) ->
  terms = parse expr
  reduceTerm term for term in terms
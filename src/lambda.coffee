# λ calculus parser
{repeatStr} = require './helpers'

# Term types/constructors.
Variable    = (name)          -> {type: Variable, name}
Abstraction = (varName, body) -> {type: Abstraction, varName, body}
Application = (left, right)   -> {type: Application, left, right}
Macro       = (name, term)    -> {type: Macro, name, term}

# Parses an input program string and returns a list of terms to be reduced.
parse = (str) ->
  # A custom Jison parser.
  parser = new (require './grammar').Parser

  # A macro table with the macros by their names.
  macros = {}
  # The terms of the program.
  terms = []

  # Add some handy functions so the parser can build the AST.
  parser.yy =
    parseAbstraction: (varName, body) -> Abstraction varName, body
    parseApplication: (left, right) -> Application left, right
    parseVariable: (name) -> Variable name
    parseMacroDefinition: (name, term) ->
      throw Error "#{name} already defined" if macros[name]
      macros[name] = Macro name, term
    parseMacroUsage: (name) ->
      throw Error "#{name} not defined" unless macros[name]
      macros[name]
    parseTermEvaluation: (term) -> terms.push term
    getProgram: -> terms

  parser.parse str

# Returns the string representation for a given term t.
# l is the number of terms "at the left" of t and r the number of term "at the
# right"; they are used for parenthesization.
termStr = (t, l = 0, r = 0) ->
  switch t.type
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
  switch t.type
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
  switch t.type
    when Variable
      # Variables cannot be reduced.
      null
    when Abstraction
      reducedBody = reduceStep t.body
      reducedBody and Abstraction t.varName, reducedBody
    when Application
      if applied = applyStep t.left, t.right
        # An application step is a reduction step:
        return applied

      # Reduce left one step; maybe next step it can be applied.
      if reducedLeft = reduceStep t.left
        return Application reducedLeft, t.right

      # Left is irreducible; try reducing right.
      reducedRight = reduceStep t.right
      reducedRight and Application t.left, reducedRight
    when Macro
      # Only if the inner term can be reduced the macro is reduced, and the
      # reduction consists on substituting the macro with the actual term.
      # TODO This is macro expansion step.
      (reduceStep t.term) and t.term

# Applies term s into term t.
applyStep = (t, s) ->
  switch t.type
    when Variable, Application
      null
    when Abstraction
      {varName, body} = t
      if renamed = renameStep body, varName, s
        return Application (Abstraction varName, renamed), s
      # TODO Beta reduction here!
      substitute body, varName, s
    when Macro
      # Same logic as reduceStep. If the inner term can be applied, create a new
      # application as the macro expansion.
      # TODO This is macro expansion step.
      (applyStep t.term, s) and Application t.term, s

renameStep = (t, x, s) ->
  switch t.type
    when Variable, Macro
      null
    when Abstraction
      return null if t.varName is x

      if (freeIn t.varName, s) and (freeIn x, t.body)
        # TODO This is alpha-conversion.
        newVarName = renameVar t.varName, t.body, s
        Abstraction newVarName, (substitute t.body, t.varName, Variable newVarName)
      else
        renamedBody = renameStep t.body, x, s
        renamedBody and Abstraction t.varName, renamedBody
    when Application
      if renamedLeft = renameStep t.left, x, s
        return Application renamedLeft, t.right
      if renamedRight = renameStep t.right, x, s
        return Application t.left, renamedRight

# Applies the substitution T[x := S]
# I.e., substitutes the variable x for the term S in the term T.
substitute = (t, x, s) ->
  switch t.type
    when Variable
      # x[x := S] = S
      # y[x := S] = y
      if t.name is x then s else t
    when Abstraction
      # (λx.E)[x := S] = λx.E
      # (λx creates a new context for x so no further substitution is needed)
      return t if t.varName is x
      # (λy.E)[x := S] = λy.(E[x := S]) given x != y and y not free in S
      # The "y not free in S" condition should be guaranteed by the renameStep
      # calls before beta-reduction.
      Abstraction t.varName, (substitute t.body, x, s)
    when Application
      # (U V)[x := S] = (U[x := S]) (V[x := S])
      Application (substitute t.left, x, s), (substitute t.right, x, s)
    when Macro
      if freeIn x, t.term
        throw Error "Logical error: #{x} is free in #{t.name}." +
          "Macros cannot have free variables"
      t

# Renames a variable to avoid naming conflicts when doing a substitution.
renameVar = (oldName, t, s) ->
  # Split the name into base and number part.
  base = oldName.replace /\d+$/, ''
  n = if m = oldName.match /\d+$/ then parseInt m[0] else 0

  loop
    newName = base + ++n
    isValid =
      # Avoid name collisions with substitution term.
      not (freeIn newName, s) and
      # Avoid name collisions with free variables in body.
      not (freeIn newName, t) and
      # Avoid name collisions with inner abstractions.
      not (varRenameCollides t, oldName, newName)
    return newName if isValid

# Whether the variable x is free in the term t.
freeIn = (x, t) ->
  switch t.type
    when Variable
      t.name is x
    when Abstraction
      t.varName isnt x and freeIn x, t.body
    when Application
      (freeIn x, t.left) or (freeIn x, t.right)
    when Macro
      freeIn x, t.term

varRenameCollides = (t, oldName, newName) ->
  switch t.type
    when Variable
      no
    when Abstraction
      # A variable rename collides with this abstraction if the old variable
      # was free in the abstraction and the new name for the variable is the
      # same as the varName of the abstraction, thus changing old free variable
      # binding.
      collisionHere = (freeIn oldName, t) and t.varName is newName
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
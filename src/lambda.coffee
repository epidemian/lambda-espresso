# λ calculus parser
{repeatStr, extend} = require './helpers'

# Term types/constructors.
Variable    = (name)          -> {type: Variable, name}
Abstraction = (varName, body) -> {type: Abstraction, varName, body}
Application = (left, right)   -> {type: Application, left, right}
Macro       = (name, term)    -> {type: Macro, name, term}

# Parses an input program string and returns an array of terms to be reduced.
parse = (str) ->
  # A custom Jison parser.
  parser = new (require './grammar').Parser

  # A macro table with the macros by their names.
  macros = {}
  # The terms of the program.
  terms = []

  # Add some handy functions so the parser can build the AST.
  parser.yy =
    parseAbstraction: Abstraction
    parseApplication: Application
    parseVariable: Variable
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
  str = switch t.type
    when Variable, Macro
      t.name
    when Abstraction
      lambda = "λ#{t.varName}"
      lambda = t.highlightVar lambda if t.highlightVar
      str = "#{lambda}.#{termStr t.body}"
      if r > 0 then "(#{str})" else str
    when Application
      str = "#{termStr t.left, 0, 1} #{termStr t.right, 1, r}"
      if l > 0 then "(#{str})" else str
  if t.highlight
    str = t.highlight str
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

# TODO: move this into an options object.
highlightStepMatch = (str) ->
  "<span class=\"match\">#{str}</span>"

highlightSubstitutionVariable = (str) ->
  "<span class=\"subst-var\">#{str}</span>"

highlightSubstitutionTerm = (str) ->
  "<span class=\"subst-term\">#{str}</span>"

highlight = (t, fn) ->
  extend {highlight: fn}, t

highlightAbstractionVar = (t, x) ->
  hx = highlight (Variable x), highlightSubstitutionVariable
  ht = substitute t, x, hx
  extend (Abstraction x, ht), highlightVar: highlightSubstitutionVariable

# A computation step, be it a β-reduction, an α-conversion or a macro expansion.
Step = (type, before, after, term) ->
  type:   type
  before: highlight before, highlightStepMatch
  after:  highlight after, highlightStepMatch
  term:   term or after

BetaReductionStep = (t, x, s) ->
  hs = highlight s, highlightSubstitutionTerm
  before = Application (highlightAbstractionVar t, x), hs
  after = substitute t, x, hs
  term = substitute t, x, s
  Step 'beta', before, after, term

# "Wraps" a step with a given function. The function must take a term and return
# a term.
# This operation is used to "go back" from recursive functions that return a
# step, wrapping that step as the recursion stack unwraps.
# Side-effect waring: this operation modifies the given step!
wrapStep = (step, fn) ->
  if step
    step.term   = fn step.term
    step.before = fn step.before
    step.after  = fn step.after
  step

# Reduces term t by one step and returns that step, or returns null.
reduceStep = (t) ->
  switch t.type
    when Variable
      # Variables cannot be reduced.
      null
    when Abstraction
      wrapStep (reduceStep t.body), (body) -> Abstraction t.varName, body
    when Application
      if applied = applyStep t.left, t.right
        # An application step is a reduction step.
        return applied

      # Reduce left one step; maybe next step it can be applied.
      if leftStep = reduceStep t.left
        return wrapStep leftStep, (left) -> Application left, t.right

      # Left is irreducible; try reducing right.
      wrapStep (reduceStep t.right), (right) -> Application t.left, right
    when Macro
      # Only if the inner term can be reduced the macro is reduced, and the
      # reduction consists on substituting the macro with the actual term.
      (reduceStep t.term) and Step 'macro', t, t.term

# Applies term s into term t by one step.
applyStep = (t, s) ->
  switch t.type
    when Variable, Application
      null
    when Abstraction
      {varName, body} = t
      if renameBodyStep = renameStep body, varName, s
        return wrapStep renameBodyStep, (body) ->
          Application (Abstraction varName, body), s
      BetaReductionStep body, varName, s
    when Macro
      # Same logic as reduceStep. If the inner term can be applied, create a new
      # application as the macro expansion.
      if applyStep t.term, s
        wrapStep (Step 'macro', t, t.term), (macro) -> (Application macro, s)

# Makes an α-convertion step (renaming) needed to make the substitution
# T[x := S] and returns that step, or null in case no renaming is needed.
# See `substitute` for the logic of substitution.
renameStep = (t, x, s) ->
  switch t.type
    when Variable, Macro
      null
    when Abstraction
      return null if t.varName is x
      # (λy.E)[x := S] = λy'.(E[y := y'][x := S]) if y is free in S and x is
      # free in E.
      # The abstraction variable must be renamed in order to avoid the free
      # occurence of y in S to become bound once S is applied into E.
      if (freeIn t.varName, s) and (freeIn x, t.body)
        newVarName = renameVar t.varName, t.body, s
        newBody = substitute t.body, t.varName, (Variable newVarName)
        Step 'alpha', t, (Abstraction newVarName, newBody)
      else
        wrapStep (renameStep t.body, x, s), (body) ->
          Abstraction t.varName, body
    when Application
      if leftStep = renameStep t.left, x, s
        return wrapStep leftStep, (left) -> Application left, t.right
      if rightStep = renameStep t.right, x, s
        return wrapStep rightStep, (right) -> Application t.left, right

# Applies the substitution T[x := S]
# I.e., substitutes the variable x for the term S in the term T.
# Returns the substituted term.
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

# Whether a variable rename collides in a given term. That is, if changing the
# occurrences of oldName with newName in t would make it change t's meaning
# (i.e. not be α-equivalent).
varRenameCollides = (t, oldName, newName) ->
  switch t.type
    when Variable
      no
    when Abstraction
      # A variable rename collides with this abstraction if the old variable
      # was free in the abstraction and the new name for the variable is the
      # same as the varName of the abstraction, thus changing old free variable
      # binding.
      collisionHere = t.varName is newName and (freeIn oldName, t)
      # Or if the renaming collides in the body of the abstraction...
      collisionHere or varRenameCollides t.body, oldName, newName
    when Application
      (varRenameCollides t.left, oldName, newName) or
      (varRenameCollides t.right, oldName, newName)
    when Macro
      varRenameCollides t.term, oldName, newName

# Reduces a term up to its normal form and returns TODO What does it return?
reduceTerm = (term) ->
  initial = termStr term
  steps = []
  maxSteps = 100
  while (step = reduceStep term) and (steps.length < maxSteps)
    term = step.term
    steps.push
      type: step.type
      before: termStr step.before
      after: termStr step.after
      # details
  final = termStr term
  terminates = steps.length isnt maxSteps or not step
  {initial, final, terminates, steps}

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
# λ calculus parser
{repeatStr, extend, timed} = require './helpers'

# Term types/constructors.
Variable    = (name)          -> {type: Variable, name}
Abstraction = (varName, body) -> {type: Abstraction, varName, body}
Application = (left, right)   -> {type: Application, left, right}
Macro       = (name, term)    -> {type: Macro, name, term}

# Parses an input program string and returns an array of terms to be reduced.
parse = timed 'parse', (str) ->
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
termStr = (t, appParens = no, absParens = no) ->
  str = switch t.type
    when Variable, Macro
      t.name
    when Abstraction
      lambda = "λ#{t.varName}"
      lambda = t.highlightVar lambda if t.highlightVar
      str = "#{lambda}.#{termStr t.body}"
      if absParens then "(#{str})" else str
    when Application
      str = "#{termStr t.left, no, yes} #{termStr t.right, yes, absParens}"
      if appParens then "(#{str})" else str
  if t.highlight
    str = t.highlight str
  str

# Show a term in a tree format. Useful for debugging.
termTreeStr = do ->
  makeLines = (t) ->
    switch t.type
      when Variable, Macro
        [t.name]
      when Abstraction
        ["λ#{t.varName}", (indentLines (makeLines t.body), '╰─', '  ')...]
      when Application
        ["@", (indentLines (makeLines t.left),  '├─', '│ ')...
              (indentLines (makeLines t.right), '╰─', '  ')...]

  indentLines = (lines, first, next) ->
    "#{if n is 0 then first else next}#{line}" for line, n in lines

  (t) ->
    (makeLines t).join '\n'

# TODO: move this into an options object.
highlightStepMatch = (str) ->
  "<span class=\"match\">#{str}</span>"

highlightSubstitutionVariable = (str) ->
  "<span class=\"subst-var\">#{str}</span>"

highlightSubstitutionTerm = (str) ->
  "<span class=\"subst-term\">#{str}</span>"

highlight = (t, fn) ->
  if t.highlight
    fn = compose fn, t.highlight
  extend {}, t, highlight: fn

highlightAbstractionVar = (t, x, fn = highlightSubstitutionVariable) ->
  hx = highlight (Variable x), fn
  ht = substitute t, x, hx
  extend (Abstraction x, ht), highlightVar: fn

# A computation step, be it a β-reduction, an α-conversion or a macro expansion.
Step = (type, before, after, term) ->
  type:   type
  before: highlight before, highlightStepMatch
  after:  highlight after, highlightStepMatch
  term:   term

BetaReductionStep = (t, x, s) ->
  hs = highlight s, highlightSubstitutionTerm
  before = Application (highlightAbstractionVar t, x), hs
  after = substitute t, x, hs
  term = substitute t, x, s
  Step 'beta', before, after, term

AlphaConversionStep = (abst, renamedAbst) ->
  before = highlightAbstractionVar abst.body, abst.varName, highlightSubstitutionVariable
  after = highlightAbstractionVar renamedAbst.body, renamedAbst.varName, highlightSubstitutionTerm
  Step 'alpha', before, after, renamedAbst

MacroExpansionStep = (t) ->
  before = highlight t, highlightSubstitutionVariable
  after = highlight t.term, highlightSubstitutionTerm
  Step 'macro', before, after, t.term

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

composeAbs = (fn, x) -> (b) -> fn Abstraction x, b
composeAppL = (fn, l) -> (r) -> fn Application l, r
composeAppR = (fn, r) -> (l) -> fn Application l, r
composeMacro = (fn, n) -> (t) -> fn Macro n, t

reduceNormal = (t, cb) ->
  switch t.type
    when Variable
      t
    when Abstraction
      Abstraction t.varName, (reduceNormal t.body, (composeAbs cb, t.varName))
    when Application
      l = reduceCallByName t.left, (composeAppR cb, t.right)
      if l.type is Abstraction
        reduceNormal (apply l, t.right, cb), cb
      else
        l = reduceNormal l, (composeAppR cb, t.right) # Finish reducing l.
        r = reduceNormal t.right, (composeAppL cb, l)
        Application l, r
    when Macro
      cb t.term
      reduceNormal t.term, (composeMacro cb, t.name)

reduceCallByName = (t, cb) ->
  switch t.type
    when Variable, Abstraction
      t
    when Application
      l = reduceCallByName t.left, (composeAppR cb, t.right)
      if l.type is Abstraction
        reduceCallByName (apply l, t.right, cb), cb
      else
        t
    when Macro
      cb t.term
      reduceCallByName t.term, (composeMacro cb, t.name)

apply = (abs, subst, cb) ->
  applied = substitute2 abs.body, abs.varName, subst, cb
  cb applied
  applied

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
      (reduceStep t.term) and MacroExpansionStep t

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
        wrapStep (MacroExpansionStep t), (macro) -> (Application macro, s)

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
        AlphaConversionStep t, (Abstraction newVarName, newBody)
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

# Applies the substitution T[x := S]
# I.e., substitutes the variable x for the term S in the term T.
# Returns the substituted term.
substitute2 = (t, x, s, cb) ->
  switch t.type
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
      if (freeIn t.varName, s) and (freeIn x, t.body)
        # (λy.E)[x := S] = λy'.(E[y := y'][x := S])
        newVarName = renameVar t.varName, t.body, s
        # Note: not passing cb as no further alpha-renames should be performed
        # on these two substitutions (so cb shouldn't be called).
        renamedBody = substitute2 t.body, t.varName, Variable newVarName
        cb Abstraction newVarName, renamedBody
        Abstraction newVarName, (substitute2 renamedBody, x, s)
      else
        # (λy.E)[x := S] = λy.(E[x := S])
        Abstraction t.varName, (substitute2 t.body, x, s, (cb and composeAbs cb, t.varName))
    when Application
      # (U V)[x := S] = (U[x := S]) (V[x := S])
      l = substitute2 t.left, x, s, (cb and composeAppR cb, t.right)
      r = substitute2 t.right, x, s, (cb and composeAppL cb, t.left)
      Application l, r
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

defaultOptions =
  maxSteps: 100

# Reduces a term up to its normal form and returns TODO What does it return?
reduceTerm = timed 'reduce', (term, options) ->
  {maxSteps} = extend {}, defaultOptions, options
  enough = {}
  steps = []
  try
    reduceNormal term, (t) ->
      throw enough if steps.length >= maxSteps
      steps.push t
    terminates = yes
  catch e
    throw e if e isnt enough
    terminates = no

  initial = termStr term
  final = termStr steps[steps.length - 1] or term
  {initial, final, terminates, steps}

parseTerm = (str) ->
  terms = parse str
  throw Error "program has #{terms.length} terms" if terms.length isnt 1
  terms[0]

exports.termTreeStr = (str) ->
  termTreeStr parseTerm str

# Parse a program with only one term.
exports.parseTerm = (str) ->
  termStr parseTerm str

# Reduce a program with only one term.
exports.reduceTerm = (str, options = {}) ->
  reduceTerm (parseTerm str), options

# Reduce a program that might have multiple terms.
exports.reduceProgram = (expr, options = {}) ->
  terms = parse expr
  reduceTerm term, options for term in terms
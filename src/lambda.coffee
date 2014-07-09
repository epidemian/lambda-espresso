# λ calculus parser
{repeatStr, extend, timed, compose, identity} = require './helpers'

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
    getProgram: -> {macros, terms}

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

highlight = (t, fn) ->
  if t.highlight
    fn = compose fn, t.highlight
  extend {}, t, highlight: fn

highlightAbstractionVar = (t, x, fn) ->
  hx = highlight (Variable x), fn
  ht = substitute t, x, hx
  extend (Abstraction x, ht), highlightVar: fn

composeAbs = (fn, x) -> (b) -> fn Abstraction x, b
composeAppL = (fn, l) -> (r) -> fn Application l, r
composeAppR = (fn, r) -> (l) -> fn Application l, r

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
      cb markStep 'macro', t, t.term
      reduceNormal t.term, cb

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
      cb markStep 'macro', t, t.term
      reduceCallByName t.term, cb

apply = (abs, subst, cb) ->
  renameCb = composeAbs (composeAppR cb, subst), abs.varName
  renamedBody = renameForSubstitution abs.body, abs.varName, subst, renameCb
  renamed = Application (Abstraction abs.varName, renamedBody), subst
  applied = applySubstitution renamedBody, abs.varName, subst
  cb markStep 'beta', renamed, applied
  applied

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
      # λx creates a new context for x so no further substitution is needed.
      return t if t.varName is x
      # (λy.E)[x := S] with x != y
      # If y is free in S and x is free in E, then must α-convert λy.E to avoid
      # name conflicts.
      if (freeIn t.varName, s) and (freeIn x, t.body)
        # (λy.E)[x := S] = λy'.(E[y := y'][x := S])
        newVarName = renameVar t.varName, t.body, s
        renamedBody = applySubstitution t.body, t.varName, Variable newVarName
        Abstraction newVarName, (substitute renamedBody, x, s)
      else
        # (λy.E)[x := S] = λy.(E[x := S])
        Abstraction t.varName, (substitute t.body, x, s)
    when Application
      # (U V)[x := S] = (U[x := S]) (V[x := S])
      Application (substitute t.left, x, s), (substitute t.right, x, s)
    when Macro
      if freeIn x, t.term
        # TODO delete. Check for free variables on macros when (or after) parsing.
        throw Error "Logical error: #{x} is free in #{t.name}." +
          "Macros cannot have free variables"
      t

# Performs the α-conversions necessary for the substitution T[x := S], but does
# not perform the substitution itself.
# Records the α-conversions by calling cb.
renameForSubstitution = (t, x, s, cb) ->
  switch t.type
    when Variable, Macro
      t
    when Abstraction
      return t if t.varName is x
      if (freeIn t.varName, s) and (freeIn x, t.body)
        newVarName = renameVar t.varName, t.body, s
        renamedBody = applySubstitution t.body, t.varName, Variable newVarName
        cb markStep 'alpha', t, (t = Abstraction newVarName, renamedBody)
      Abstraction t.varName, (renameForSubstitution t.body, x, s, (composeAbs cb, t.varName))
    when Application
      l = renameForSubstitution t.left, x, s, (composeAppR cb, t.right)
      r = renameForSubstitution t.right, x, s, (composeAppL cb, l)
      Application l, r

# Applies the substitution T[x := S] directly, without performing α-conversions.
applySubstitution = (t, x, s) ->
  switch t.type
    when Variable
      if t.name is x then s else t
    when Abstraction
      if t.varName is x
        t
      else
        Abstraction t.varName, (applySubstitution t.body, x, s)
    when Application
      Application (applySubstitution t.left, x, s), (applySubstitution t.right, x, s)
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

markStep = (type, before, after) ->
  extend {}, after, step: {type, before}

find = (t, fn) ->
  return t if fn t
  switch t.type
    when Variable, Macro
      null
    when Abstraction
      find t.body, fn
    when Application
      (find t.left, fn) or (find t.right, fn)

replace = (t, from, to) ->
  return to if t is from
  switch t.type
    when Variable, Macro
      t
    when Abstraction
      body = replace t.body, from, to
      if t.body is body then t else Abstraction t.varName, body
    when Application
      l = replace t.left, from, to
      if t.left is l
        r = replace t.right, from, to
        if t.right is r then t else Application l, r
      else
        Application l, t.right

expandStep = (t, options = {}) ->
  stepTerm = find t, (subT) -> subT.step
  type = stepTerm.step.type
  before = stepTerm.step.before
  after = stepTerm

  highlightFormer = options.highlightFormerTerm or identity
  highlightSubst = options.highlightSubstitutionTerm or identity
  highlightStep = options.highlightStep or identity

  switch type
    when 'alpha'
      before = highlightAbstractionVar before.body, before.varName, highlightFormer
      after = highlightAbstractionVar after.body, after.varName, highlightSubst
    when 'beta'
      hs = highlight before.right, highlightSubst
      ha = highlightAbstractionVar before.left.body, before.left.varName, highlightFormer
      before = Application ha, hs
      after = substitute before.left.body, before.left.varName, hs
    when 'macro'
      before = highlight before, highlightFormer
      after = highlight after, highlightSubst

  before = highlight before, highlightStep
  after = highlight after, highlightStep

  before = termStr replace t, stepTerm, before
  after = termStr replace t, stepTerm, after

  {type, before, after}

alphaEq = (t1, t2) ->
  return alphaEq t1.term, t2 if t1.type is Macro
  return alphaEq t1, t2.term if t2.type is Macro
  return no unless t1.type is t2.type
  switch t1.type
    when Variable
      t1.name is t2.name
    when Abstraction
      if t1.varName is t2.varName
        alphaEq t1.body, t2.body
      else
        alphaEq t1.body, (substitute t2.body, t2.varName, Variable(t1.varName))
    when Application
      (alphaEq t1.left, t2.left) and (alphaEq t1.right, t2.right)

findSynonyms = (term, macros) ->
  name for name, macro of macros when alphaEq term, macro

defaultOptions =
  maxSteps: 100

# Reduces a term up to its normal form and returns TODO What does it return?
reduceTerm = timed 'reduce', (term, macros, options) ->
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

  initial = term
  final = steps[steps.length - 1] or term
  finalSynonyms = findSynonyms final, macros
  initial = termStr initial
  final = termStr final
  totalSteps = steps.length
  renderStep = (i, options) ->
    expandStep steps[i], options
  {initial, final, finalSynonyms, terminates, totalSteps, renderStep}

parseTerm = (str) ->
  {terms} = parse str
  throw Error "program has #{terms.length} terms" if terms.length isnt 1
  terms[0]

exports.termTreeStr = (str) ->
  termTreeStr parseTerm str

# Parse a program with only one term.
exports.parseTerm = (str) ->
  termStr parseTerm str

# Reduce a program with only one term.
exports.reduceTerm = (str, options = {}) ->
  reduceTerm (parseTerm str), {}, options

# Reduce a program that might have multiple terms.
exports.reduceProgram = (expr, options = {}) ->
  {terms, macros} = parse expr
  reduceTerm term, macros, options for term in terms
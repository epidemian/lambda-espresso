{extend, timed, compose, identity} = require './helpers'
{Var, Fun, App, Def} = require './core'
{parse} = require './parser'

# Returns the string representation for a given term t.
termStr = (t, appParens = no, funParens = no) ->
  str = switch t.type
    when Var, Def
      t.name
    when Fun
      lambda = "λ#{t.param}"
      lambda = t.highlightVar lambda if t.highlightVar
      str = "#{lambda}.#{termStr t.body}"
      if funParens then "(#{str})" else str
    when App
      str = "#{termStr t.left, no, yes} #{termStr t.right, yes, funParens}"
      if appParens then "(#{str})" else str
  if t.highlight
    str = t.highlight str
  str

highlight = (t, fn) ->
  if t.highlight
    fn = compose fn, t.highlight
  extend {}, t, highlight: fn

highlightFunctionVar = (t, x, fn) ->
  hx = highlight (Var x), fn
  ht = substitute t, x, hx
  extend (Fun x, ht), highlightVar: fn

composeFun = (fn, x) -> (b) -> fn Fun x, b
composeAppL = (fn, l) -> (r) -> fn App l, r
composeAppR = (fn, r) -> (l) -> fn App l, r

reduceCallByName = (t, cb) ->
  switch t.type
    when Var, Fun
      t
    when App
      l = reduceCallByName t.left, (composeAppR cb, t.right)
      if l.type is Fun
        reduceCallByName (apply l, t.right, cb), cb
      else
        # TODO This is suspicious. If some reductions were made in previous
        # l = reduceCallByName ... call, then we are losing the result of those
        # reductions, but we have recorded them with cb.
        App l, t.right
    when Def
      cb markStep 'def', t, t.term
      reduceCallByName t.term, cb

reduceNormal = (t, cb) ->
  switch t.type
    when Var
      t
    when Fun
      Fun t.param, (reduceNormal t.body, (composeFun cb, t.param))
    when App
      l = reduceCallByName t.left, (composeAppR cb, t.right)
      if l.type is Fun
        reduceNormal (apply l, t.right, cb), cb
      else
        l = reduceNormal l, (composeAppR cb, t.right) # Finish reducing l.
        r = reduceNormal t.right, (composeAppL cb, l)
        App l, r
    when Def
      cb markStep 'def', t, t.term
      reduceNormal t.term, cb

reduceCallByValue = (t, cb) ->
  switch t.type
    when Var, Fun
      t
    when App
      l = reduceCallByValue t.left, (composeAppR cb, t.right)
      r = reduceCallByValue t.right, (composeAppL cb, l)
      if l.type is Fun
        reduceCallByValue (apply l, r, cb), cb
      else
        App l, r
    when Def
      cb markStep 'def', t, t.term
      reduceCallByValue t.term, cb

reduceApplicative = (t, cb) ->
  switch t.type
    when Var
      t
    when Fun
      Fun t.param, (reduceApplicative t.body, (composeFun cb, t.param))
    when App
      l = reduceCallByValue t.left, (composeAppR cb, t.right)
      if l.type is Fun
        r = reduceCallByValue t.right, (composeAppL cb, l)
        reduceApplicative (apply l, r, cb), cb
      else
        l = reduceApplicative l, (composeAppR cb, t.right)
        r = reduceApplicative t.right, (composeAppL cb, l)
        App l, r
    when Def
      cb markStep 'def', t, t.term
      reduceApplicative t.term, cb

apply = (fun, subst, cb) ->
  renameCb = composeFun (composeAppR cb, subst), fun.param
  renamedBody = renameForSubstitution fun.body, fun.param, subst, renameCb
  renamed = App (Fun fun.param, renamedBody), subst
  applied = applySubstitution renamedBody, fun.param, subst
  cb markStep 'beta', renamed, applied
  applied

# Applies the substitution T[x := S]
# I.e., substitutes the variable x for the term S in the term T.
substitute = (t, x, s) ->
  switch t.type
    when Var
      # x[x := S] = S
      # y[x := S] = y
      if t.name is x then s else t
    when Fun
      # (λx.E)[x := S] = λx.E
      # λx creates a new context for x so no further substitution is needed.
      return t if t.param is x
      # (λy.E)[x := S] with x != y
      # If y is free in S and x is free in E, then must α-convert λy.E to avoid
      # name conflicts.
      if (freeIn t.param, s) and (freeIn x, t.body)
        # (λy.E)[x := S] = λy'.(E[y := y'][x := S])
        newVarName = renameVar t.param, t.body, s
        renamedBody = applySubstitution t.body, t.param, Var newVarName
        Fun newVarName, (substitute renamedBody, x, s)
      else
        # (λy.E)[x := S] = λy.(E[x := S])
        Fun t.param, (substitute t.body, x, s)
    when App
      # (U V)[x := S] = (U[x := S]) (V[x := S])
      App (substitute t.left, x, s), (substitute t.right, x, s)
    when Def
      t

# Performs the α-conversions necessary for the substitution T[x := S], but does
# not perform the substitution itself.
# Records the α-conversions by calling cb.
renameForSubstitution = (t, x, s, cb) ->
  switch t.type
    when Var, Def
      t
    when Fun
      return t if t.param is x
      if (freeIn t.param, s) and (freeIn x, t.body)
        newVarName = renameVar t.param, t.body, s
        renamedBody = applySubstitution t.body, t.param, Var newVarName
        cb markStep 'alpha', t, (t = Fun newVarName, renamedBody)
      Fun t.param, (renameForSubstitution t.body, x, s, (composeFun cb, t.param))
    when App
      l = renameForSubstitution t.left, x, s, (composeAppR cb, t.right)
      r = renameForSubstitution t.right, x, s, (composeAppL cb, l)
      App l, r

# Applies the substitution T[x := S] directly, without performing α-conversions.
applySubstitution = (t, x, s) ->
  switch t.type
    when Var
      if t.name is x then s else t
    when Fun
      if t.param is x
        t
      else
        Fun t.param, (applySubstitution t.body, x, s)
    when App
      App (applySubstitution t.left, x, s), (applySubstitution t.right, x, s)
    when Def
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
      # Avoid name collisions with inner functions.
      not (varRenameCollides t, oldName, newName)
    return newName if isValid

# Whether the variable x is free in the term t.
freeIn = (x, t) ->
  switch t.type
    when Var
      t.name is x
    when Fun
      t.param isnt x and freeIn x, t.body
    when App
      (freeIn x, t.left) or (freeIn x, t.right)
    when Def
      freeIn x, t.term

# Whether a variable rename collides in a given term. That is, if changing the
# occurrences of oldName with newName in t would make it change t's meaning
# (i.e. not be α-equivalent).
varRenameCollides = (t, oldName, newName) ->
  switch t.type
    when Var
      no
    when Fun
      # A variable rename collides with this function if the old variable
      # was free in the function and the new name for the variable is the
      # same as the param of the function, thus changing old free variable
      # binding.
      collisionHere = t.param is newName and (freeIn oldName, t)
      # Or if the renaming collides in the body of the function...
      collisionHere or varRenameCollides t.body, oldName, newName
    when App
      (varRenameCollides t.left, oldName, newName) or
      (varRenameCollides t.right, oldName, newName)
    when Def
      varRenameCollides t.term, oldName, newName

markStep = (type, before, after) ->
  extend {}, after, step: {type, before}

find = (t, fn) ->
  return t if fn t
  switch t.type
    when Var, Def
      null
    when Fun
      find t.body, fn
    when App
      (find t.left, fn) or (find t.right, fn)

replace = (t, from, to) ->
  return to if t is from
  switch t.type
    when Var, Def
      t
    when Fun
      body = replace t.body, from, to
      if t.body is body then t else Fun t.param, body
    when App
      l = replace t.left, from, to
      if t.left is l
        r = replace t.right, from, to
        if t.right is r then t else App l, r
      else
        App l, t.right

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
      before = highlightFunctionVar before.body, before.param, highlightFormer
      after = highlightFunctionVar after.body, after.param, highlightSubst
    when 'beta'
      hs = highlight before.right, highlightSubst
      ha = highlightFunctionVar before.left.body, before.left.param, highlightFormer
      before = App ha, hs
      after = substitute before.left.body, before.left.param, hs
    when 'def'
      before = highlight before, highlightFormer
      after = highlight after, highlightSubst

  before = highlight before, highlightStep
  after = highlight after, highlightStep

  before = termStr replace t, stepTerm, before
  after = termStr replace t, stepTerm, after

  {type, before, after}

alphaEq = (t1, t2) ->
  return alphaEq t1.term, t2 if t1.type is Def
  return alphaEq t1, t2.term if t2.type is Def
  return no unless t1.type is t2.type
  switch t1.type
    when Var
      t1.name is t2.name
    when Fun
      if t1.param is t2.param
        alphaEq t1.body, t2.body
      else
        alphaEq t1.body, (substitute t2.body, t2.param, Var(t1.param))
    when App
      (alphaEq t1.left, t2.left) and (alphaEq t1.right, t2.right)

findSynonyms = (term, defs) ->
  name for name, defTerm of defs when alphaEq term, defTerm

defaultOptions =
  maxSteps: 100
  strategy: 'normal'

reduceFunctions =
  normal: reduceNormal
  applicative: reduceApplicative
  cbn: reduceCallByName
  cbv: reduceCallByValue

# Reduces a term up to its normal form and returns TODO What does it return?
reduceTerm = timed 'reduce', (term, defs, options) ->
  {maxSteps, strategy} = extend {}, defaultOptions, options
  reduce = reduceFunctions[strategy]
  enough = {}
  steps = []
  try
    reduce term, (t) ->
      throw enough if steps.length >= maxSteps
      steps.push t
    terminates = yes
  catch e
    throw e if e isnt enough
    terminates = no

  initial = term
  final = steps[steps.length - 1] or term
  finalSynonyms = findSynonyms final, defs
  initial = termStr initial
  final = termStr final
  totalSteps = steps.length
  renderStep = (i, options) ->
    expandStep steps[i], options
  {initial, final, finalSynonyms, terminates, totalSteps, renderStep}

# Reduce a program and return with the reduction for each term in the program.
reduceProgram = (program, options = {}) ->
  {terms, defs} = parse program
  reduceTerm term, defs, options for term in terms

module.exports = {
  Var, Fun, App, Def
  parse
  termStr
  reduceProgram
}

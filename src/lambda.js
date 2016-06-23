let {extend, timed, compose, identity} = require('./helpers')
let {Var, Fun, App, Def} = require('./core')
let {parse} = require('./parser')

// Returns the string representation for a given term t.
let termStr = (t, appParens = false, funParens = false) => {
  let h = t.highlight || identity
  switch (t.type) {
  case Var:
  case Def:
    return h(t.name)
  case Fun:
    let lambda = `λ${t.param}`
    if (t.highlightVar) lambda = t.highlightVar(lambda)
    let funStr = `${lambda}.${termStr(t.body)}`
    return h(funParens ? `(${funStr})` : funStr)
  case App:
    let lStr = termStr(t.left, false, true)
    let rStr = termStr(t.right, true, funParens)
    let appStr = `${lStr} ${rStr}`
    return h(appParens ? `(${appStr})` : appStr)
  }
}

let highlight = (t, fn) => {
  if (t.highlight)
    fn = compose(fn, t.highlight)
  return extend({}, t, {highlight: fn})
}

let highlightFunctionVar = (t, x, fn) => {
  let hx = highlight(Var(x), fn)
  let ht = substitute(t, x, hx)
  return extend(Fun(x, ht), {highlightVar: fn})
}

let composeFun = (fn, x) => (b) => fn(Fun(x, b))
let composeAppL = (fn, l) => (r) => fn(App(l, r))
let composeAppR = (fn, r) => (l) => fn(App(l, r))

let reduceCallByName = (t, cb) => {
  switch (t.type) {
  case Var:
  case Fun:
    return t
  case App:
    let l = reduceCallByName(t.left, composeAppR(cb, t.right))
    if (l.type === Fun)
      return reduceCallByName(apply(l, t.right, cb), cb)
    else
      // TODO This is suspicious. If some reductions were made in previous
      // l = reduceCallByName ... call, then we are losing the result of those
      // reductions, but we have recorded them with cb.
      return App(l, t.right)
  case Def:
    cb(markStep('def', t, t.term))
    return reduceCallByName(t.term, cb)
  }
}

let reduceNormal = (t, cb) => {
  switch (t.type) {
  case Var:
    return t
  case Fun:
    return Fun(t.param, reduceNormal(t.body, composeFun(cb, t.param)))
  case App:
    let l = reduceCallByName(t.left, composeAppR(cb, t.right))
    if (l.type === Fun) {
      return reduceNormal(apply(l, t.right, cb), cb)
    } else {
      l = reduceNormal(l, composeAppR(cb, t.right)) // Finish reducing l.
      let r = reduceNormal(t.right, composeAppL(cb, l))
      return App(l, r)
    }
  case Def:
    cb(markStep('def', t, t.term))
    return reduceNormal(t.term, cb)
  }
}

let reduceCallByValue = (t, cb) => {
  switch (t.type) {
  case Var:
  case Fun:
    return t
  case App:
    let l = reduceCallByValue(t.left, composeAppR(cb, t.right))
    let r = reduceCallByValue(t.right, composeAppL(cb, l))
    if (l.type === Fun)
      return reduceCallByValue(apply(l, r, cb), cb)
    else
      return App(l, r)
  case Def:
    cb(markStep('def', t, t.term))
    return reduceCallByValue(t.term, cb)
  }
}

let reduceApplicative = (t, cb) => {
  switch (t.type) {
  case Var:
    return t
  case Fun:
    return Fun(t.param, reduceApplicative(t.body, composeFun(cb, t.param)))
  case App:
    let l = reduceCallByValue(t.left, composeAppR(cb, t.right))
    if (l.type === Fun) {
      let r = reduceCallByValue(t.right, composeAppL(cb, l))
      return reduceApplicative(apply(l, r, cb), cb)
    } else {
      l = reduceApplicative(l, composeAppR(cb, t.right))
      let r = reduceApplicative(t.right, composeAppL(cb, l))
      return App(l, r)
    }
  case Def:
    cb(markStep('def', t, t.term))
    return reduceApplicative(t.term, cb)
  }
}

let reduceEta = (t, cb) => {
  switch (t.type) {
  case Var:
    return t
  case Fun:
    // λx.(F x) = F if x is free in F
    let isEta = t.body.type === App &&
      t.body.right.type === Var &&
      t.body.right.name === t.param &&
      !freeIn(t.param, t.body.left)
    if (isEta) {
      cb(markStep('eta', t, t.body.left))
      return t.body.left
    } else {
      return Fun(t.param, reduceEta(t.body, composeFun(cb, t.param)))
    }
  case App:
    let l = reduceEta(t.left, composeAppR(cb, t.right))
    let r = reduceEta(t.right, composeAppR(cb, l))
    return App(l, r)
  case Def:
    return t
  }
}

let apply = (fun, subst, cb) => {
  let renameCb = composeFun(composeAppR(cb, subst), fun.param)
  let renamedBody = renameForSubstitution(fun.body, fun.param, subst, renameCb)
  let renamed = App(Fun(fun.param, renamedBody), subst)
  let applied = applySubstitution(renamedBody, fun.param, subst)
  cb(markStep('beta', renamed, applied))
  return applied
}

// Applies the substitution T[x := S]
// I.e., substitutes the variable x for the term S in the term T.
let substitute = (t, x, s) => {
  switch (t.type) {
  case Var:
    // x[x := S] = S
    // y[x := S] = y
    return t.name === x ? s : t
  case Fun:
    // (λx.E)[x := S] = λx.E
    // λx creates a new context for x so no further substitution is needed.
    if (t.param === x) return t
    // (λy.E)[x := S] with x != y
    // If y is free in S and x is free in E, then must α-convert λy.E to avoid
    // name conflicts.
    if (freeIn(t.param, s) && freeIn(x, t.body)) {
      // (λy.E)[x := S] = λy'.(E[y := y'][x := S])
      let newVarName = renameVar(t.param, t.body, s)
      let renamedBody = applySubstitution(t.body, t.param, Var(newVarName))
      return Fun(newVarName, substitute(renamedBody, x, s))
    } else {
      // (λy.E)[x := S] = λy.(E[x := S])
      return Fun(t.param, substitute(t.body, x, s))
    }
  case App:
    // (U V)[x := S] = (U[x := S]) (V[x := S])
    return App(substitute(t.left, x, s), substitute(t.right, x, s))
  case Def:
    return t
  }
}

// Performs the α-conversions necessary for the substitution T[x := S], but does
// not perform the substitution itself.
// Records the α-conversions by calling cb.
let renameForSubstitution = (t, x, s, cb) => {
  switch (t.type) {
  case Var:
  case Def:
    return t
  case Fun:
    if (t.param === x) return t
    if (freeIn(t.param, s) && freeIn(x, t.body)) {
      let newVarName = renameVar(t.param, t.body, s)
      let renamedBody = applySubstitution(t.body, t.param, Var(newVarName))
      cb(markStep('alpha', t, t = Fun(newVarName, renamedBody)))
    }
    let body = renameForSubstitution(t.body, x, s, composeFun(cb, t.param))
    return Fun(t.param, body)
  case App:
    let l = renameForSubstitution(t.left, x, s, composeAppR(cb, t.right))
    let r = renameForSubstitution(t.right, x, s, composeAppL(cb, l))
    return App(l, r)
  }
}

// Applies the substitution T[x := S] directly, without doing α-conversions.
let applySubstitution = (t, x, s) => {
  switch (t.type) {
  case Var:
    return t.name === x ? s : t
  case Fun:
    return t.param === x
      ? t
      : Fun(t.param, applySubstitution(t.body, x, s))
  case App:
    let l = applySubstitution(t.left, x, s)
    let r = applySubstitution(t.right, x, s)
    return App(l, r)
  case Def:
    return t
  }
}

// Renames a variable to avoid naming conflicts case doing: a substitution.
let renameVar = (oldName, t, s) => {
  // Split the name into base and number part.
  let base = oldName.replace(/\d+$/, '')
  let match = oldName.match(/\d+$/)
  let n = match ? parseInt(match[0]) : 0

  while (true) {
    n++
    let newName = base + n
    let isValid =
      // Avoid name collisions with substitution term.
      !freeIn(newName, s) &&
      // Avoid name collisions with free variables in body.
      !freeIn(newName, t) &&
      // Avoid name collisions with inner functions.
      !varRenameCollides(t, oldName, newName)
    if (isValid)
      return newName
  }
}

// Whether the variable x is free in the term t.
let freeIn = (x, t) => {
  switch (t.type) {
  case Var:
    return t.name === x
  case Fun:
    return t.param !== x && freeIn(x, t.body)
  case App:
    return freeIn(x, t.left) || freeIn(x, t.right)
  case Def:
    // Definitions don't have free variables.
    return false
  }
}

// Whether a variable rename collides in a given term. That is, if changing the
// occurrences of oldName with newName in t would make it change t's meaning
// (i.e. not be α-equivalent).
let varRenameCollides = (t, oldName, newName) => {
  switch (t.type) {
  case Var:
  case Def:
    return false
  case Fun:
    // A variable rename collides with this function if the old variable
    // was free in the function and the new name for the variable is the
    // same as the param of the function, thus changing old free variable
    // binding.
    return t.param === newName && freeIn(oldName, t) ||
      // Or if the renaming collides in the body of the function.
      varRenameCollides(t.body, oldName, newName)
  case App:
    return varRenameCollides(t.left, oldName, newName) ||
      varRenameCollides(t.right, oldName, newName)
  }
}

let markStep = (type, before, after) =>
  extend({}, after, {step: {type, before}})

let find = (t, fn) => {
  if (fn(t))
    return t
  switch (t.type) {
  case Var:
  case Def:
    return
  case Fun:
    return find(t.body, fn)
  case App:
    return find(t.left, fn) || find(t.right, fn)
  }
}

let replace = (t, from, to) => {
  if (t === from)
    return to
  switch (t.type) {
  case Var:
  case Def:
    return t
  case Fun:
    let body = replace(t.body, from, to)
    return t.body === body ? t : Fun(t.param, body)
  case App:
    let l = replace(t.left, from, to)
    if (t.left !== l) return App(l, t.right)
    let r = replace(t.right, from, to)
    return t.right === r ? t : App(l, r)
  }
}

let expandStep = (t, options = {}) => {
  let stepTerm = find(t, subT => subT.step)
  let type = stepTerm.step.type
  let before = stepTerm.step.before
  let after = stepTerm

  let highlightFormer = options.highlightFormerTerm || identity
  let highlightSubst = options.highlightSubstitutionTerm || identity
  let highlightStep = options.highlightStep || identity

  switch (type) {
  case 'alpha':
    before = highlightFunctionVar(before.body, before.param, highlightFormer)
    after = highlightFunctionVar(after.body, after.param, highlightSubst)
    break
  case 'beta':
    let fun = before.left
    let hs = highlight(before.right, highlightSubst)
    let ha = highlightFunctionVar(fun.body, fun.param, highlightFormer)
    before = App(ha, hs)
    after = substitute(fun.body, fun.param, hs)
    break
  case 'eta':
  case 'def':
    before = highlight(before, highlightFormer)
    after = highlight(after, highlightSubst)
  }

  before = highlight(before, highlightStep)
  after = highlight(after, highlightStep)

  before = termStr(replace(t, stepTerm, before))
  after = termStr(replace(t, stepTerm, after))

  return {type, before, after}
}

let alphaEq = (t1, t2) => {
  if (t1.type === Def) return alphaEq(t1.term, t2)
  if (t2.type === Def) return alphaEq(t1, t2.term)
  if (t1.type !== t2.type) return false
  switch (t1.type) {
  case Var:
    return t1.name === t2.name
  case Fun:
    if (t1.param === t2.param)
      return alphaEq(t1.body, t2.body)
    else
      return alphaEq(t1.body, substitute(t2.body, t2.param, Var(t1.param)))
  case App:
    return alphaEq(t1.left, t2.left) && alphaEq(t1.right, t2.right)
  }
}

let findSynonyms = (term, defs) => {
  let synonyms = []
  for (let name in defs)
    if (alphaEq(term, defs[name]))
      synonyms.push(name)
  return synonyms
}

let reduceFunctions = {
  normal: reduceNormal,
  applicative: reduceApplicative,
  cbn: reduceCallByName,
  cbv: reduceCallByValue,
}

let reduceGeneric = (t, {strategy, etaEnabled}, cb) => {
  let reduce = reduceFunctions[strategy]
  let reduced = reduce(t, cb)
  if (etaEnabled)
    reduced = reduceEta(reduced, cb)
  return reduced
}

// Reduces a term up to its normal form.
let reduceTerm = timed('reduce', (term, defs,
    {maxSteps = 100, strategy = 'normal', etaEnabled = false} = {}) => {
  let enough = {}
  let steps = []
  let terminates = false
  try {
    reduceGeneric(term, {strategy, etaEnabled}, step => {
      if (steps.length >= maxSteps) throw enough
      steps.push(step)
    })
    terminates = true
  } catch (e) {
    if (e !== enough) throw e
    terminates = false
  }

  let last = steps[steps.length - 1] || term
  let finalSynonyms = findSynonyms(last, defs)
  let initial = termStr(term)
  let final = termStr(last)
  let totalSteps = steps.length
  let renderStep = (i, options) =>
    expandStep(steps[i], options)
  return {initial, final, finalSynonyms, terminates, totalSteps, renderStep}
})

// Reduce a program and return with the reduction for each term in the program.
let reduceProgram = (program, options = {}) => {
  let {terms, defs} = parse(program)
  return terms.map(term => reduceTerm(term, defs, options))
}

module.exports = {
  Var, Fun, App, Def,
  parse,
  termStr,
  reduceProgram,
}

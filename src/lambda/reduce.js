let {Var, Fun, App, Def} = require('./terms')
let {renameForSubstitution, applySubstitution} = require('./substitute')
let {markStep, composeFun, composeAppL, composeAppR} = require('./helpers')
let freeIn = require('./free-in')

module.exports = (t, {strategy, etaEnabled}, cb) => {
  let reduce = reduceFunctions[strategy]
  let reduced = reduce(t, cb)
  if (etaEnabled) {
    reduced = reduceEta(reduced, cb)
  }
  return reduced
}

let reduceCallByName = (t, cb) => {
  switch (t.type) {
  case Var:
  case Fun:
    return t
  case App:
    let l = reduceCallByName(t.left, composeAppR(cb, t.right))
    return l.type === Fun
      ? reduceCallByName(apply(l, t.right, cb), cb)
      // TODO This is suspicious. If some reductions were made in previous
      // l = reduceCallByName ... call, then we are losing the result of those
      // reductions, but we have recorded them with cb.
      : App(l, t.right)
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
    return l.type === Fun
      ? reduceCallByValue(apply(l, r, cb), cb)
      : App(l, r)
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

let apply = (fun, subst, cb) => {
  let renameCb = composeFun(composeAppR(cb, subst), fun.param)
  let renamedBody = renameForSubstitution(fun.body, fun.param, subst, renameCb)
  let renamed = App(Fun(fun.param, renamedBody), subst)
  let applied = applySubstitution(renamedBody, fun.param, subst)
  cb(markStep('beta', renamed, applied))
  return applied
}

// Performs any available η-reductions on a term.
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

let reduceFunctions = {
  normal: reduceNormal,
  applicative: reduceApplicative,
  cbn: reduceCallByName,
  cbv: reduceCallByValue
}

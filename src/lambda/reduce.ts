import freeIn from './free-in'
import {
  Callback,
  composeAppL,
  composeAppR,
  composeFun,
  markStep
} from './helpers'
import { applySubstitution, renameForSubstitution } from './substitute'
import { App, Def, Fun, Term } from './terms'

export type Options = {
  strategy: keyof typeof reduceFunctions
  etaEnabled: boolean
}

const reduce = (t: Term, { strategy, etaEnabled }: Options, cb: Callback) => {
  const reducer = reduceFunctions[strategy]
  let reduced = reducer(t, cb)
  if (etaEnabled) {
    reduced = reduceEta(reduced, cb)
  }
  return reduced
}

export default reduce

type Reducer = (t: Term, cb: Callback) => Term

// Note: the implementation of these reduction strategies were based on the
// paper "Demonstrating Lambda Calculus Reduction", by Peter Sestoft
// See: http://itu.dk/people/sestoft/papers/sestoft-lamreduce.pdf

const reduceCallByName: Reducer = (t, cb) => {
  switch (t.type) {
    case 'var':
    case 'fun':
      return t
    case 'app':
      const l = reduceCallByName(t.left, composeAppR(cb, t.right))
      return l.type === 'fun'
        ? reduceCallByName(apply(l, t.right, cb), cb)
        : App(l, t.right)
    case 'def':
      return reduceCallByName(resolveDefinition(t, cb), cb)
  }
}

const reduceNormal: Reducer = (t, cb) => {
  switch (t.type) {
    case 'var':
      return t
    case 'fun':
      return Fun(t.param, reduceNormal(t.body, composeFun(cb, t.param)))
    case 'app':
      let l = reduceCallByName(t.left, composeAppR(cb, t.right))
      if (l.type === 'fun') {
        return reduceNormal(apply(l, t.right, cb), cb)
      } else {
        l = reduceNormal(l, composeAppR(cb, t.right)) // Finish reducing l.
        const r = reduceNormal(t.right, composeAppL(cb, l))
        return App(l, r)
      }
    case 'def':
      return reduceNormal(resolveDefinition(t, cb), cb)
  }
}

const reduceCallByValue: Reducer = (t, cb) => {
  switch (t.type) {
    case 'var':
    case 'fun':
      return t
    case 'app':
      const l = reduceCallByValue(t.left, composeAppR(cb, t.right))
      const r = reduceCallByValue(t.right, composeAppL(cb, l))
      return l.type === 'fun'
        ? reduceCallByValue(apply(l, r, cb), cb)
        : App(l, r)
    case 'def':
      return reduceCallByValue(resolveDefinition(t, cb), cb)
  }
}

const reduceApplicative: Reducer = (t, cb) => {
  switch (t.type) {
    case 'var':
      return t
    case 'fun':
      return Fun(t.param, reduceApplicative(t.body, composeFun(cb, t.param)))
    case 'app':
      let l = reduceCallByValue(t.left, composeAppR(cb, t.right))
      if (l.type === 'fun') {
        const r = reduceApplicative(t.right, composeAppL(cb, l))
        return reduceApplicative(apply(l, r, cb), cb)
      } else {
        l = reduceApplicative(l, composeAppR(cb, t.right))
        const r = reduceApplicative(t.right, composeAppL(cb, l))
        return App(l, r)
      }
    case 'def':
      return reduceApplicative(resolveDefinition(t, cb), cb)
  }
}

const apply = (fun: Fun, subst: Term, cb: Callback) => {
  const renameCb = composeFun(composeAppR(cb, subst), fun.param)
  const renamedBody = renameForSubstitution(
    fun.body,
    fun.param,
    subst,
    renameCb
  )
  const renamed = App(Fun(fun.param, renamedBody), subst)
  const applied = applySubstitution(renamedBody, fun.param, subst)
  cb(markStep({ type: 'beta', before: renamed, after: applied }))
  return applied
}

// Performs any available η-reductions on a term.
const reduceEta: Reducer = (t, cb) => {
  switch (t.type) {
    case 'var':
      return t
    case 'fun':
      // First reduce "down" in case the body is an application and its rhs can
      // be eta-reduced down to a var.
      const body = reduceEta(t.body, composeFun(cb, t.param))
      const before = body === t.body ? t : Fun(t.param, body)
      // λx.(F x) = F if x is free in F
      if (
        body.type === 'app' &&
        body.right.type === 'var' &&
        body.right.name === t.param &&
        !freeIn(t.param, body.left)
      ) {
        cb(markStep({ type: 'eta', before, after: body.left }))
        return body.left
      } else {
        return before
      }
    case 'app':
      const l = reduceEta(t.left, composeAppR(cb, t.right))
      const r = reduceEta(t.right, composeAppL(cb, l))
      return App(l, r)
    case 'def':
      return t
  }
}

const reduceFunctions = {
  normal: reduceNormal,
  applicative: reduceApplicative,
  cbn: reduceCallByName,
  cbv: reduceCallByValue
}

const resolveDefinition = (def: Def, cb: Callback) => {
  let after = def.term
  while (after.type === 'def') {
    after = after.term
  }
  cb(markStep({ type: 'def', before: def, after }))
  return after
}

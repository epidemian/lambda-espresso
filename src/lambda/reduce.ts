import freeIn from './free-in'
import {
  Callback,
  composeAppL,
  composeAppR,
  composeFun,
  markStep
} from './helpers'
import { applySubstitution, renameForSubstitution } from './substitute'
import { App, Fun, Term } from './terms'

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
      cb(markStep({ type: 'def', before: t, after: t.term }))
      return reduceCallByName(t.term, cb)
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
      cb(markStep({ type: 'def', before: t, after: t.term }))
      return reduceNormal(t.term, cb)
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
      cb(markStep({ type: 'def', before: t, after: t.term }))
      return reduceCallByValue(t.term, cb)
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
        const r = reduceCallByValue(t.right, composeAppL(cb, l))
        return reduceApplicative(apply(l, r, cb), cb)
      } else {
        l = reduceApplicative(l, composeAppR(cb, t.right))
        const r = reduceApplicative(t.right, composeAppL(cb, l))
        return App(l, r)
      }
    case 'def':
      cb(markStep({ type: 'def', before: t, after: t.term }))
      return reduceApplicative(t.term, cb)
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
      // λx.(F x) = F if x is free in F
      if (
        t.body.type === 'app' &&
        t.body.right.type === 'var' &&
        t.body.right.name === t.param &&
        !freeIn(t.param, t.body.left)
      ) {
        cb(markStep({ type: 'eta', before: t, after: t.body.left }))
        return t.body.left
      } else {
        return Fun(t.param, reduceEta(t.body, composeFun(cb, t.param)))
      }
    case 'app':
      const l = reduceEta(t.left, composeAppR(cb, t.right))
      const r = reduceEta(t.right, composeAppR(cb, l))
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

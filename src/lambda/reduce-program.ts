import { identity, timed } from '../utils'
import alphaEq from './alpha-eq'
import format from './format'
import { Definitions, Step } from './helpers'
import parse from './parse'
import reduce, { Options as ReduceOptions } from './reduce'
import { substitute } from './substitute'
import { App, Fun, Term, Var } from './terms'

export type Options = Partial<ReduceOptions> & {
  maxSteps?: number
}

export type Reduction = {
  initial: string
  final: string
  finalSynonyms: string[]
  terminates: boolean
  totalSteps: number
  renderStep: (i: number, options: RenderStepOptions) => RenderedStep
}

type RenderStepOptions = {
  highlightFormerTerm?: StrFun
  highlightSubstitutionTerm?: StrFun
  highlightStep?: StrFun
}

type StrFun = (s: string) => string

type RenderedStep = {
  type: 'alpha' | 'beta' | 'eta' | 'def'
  before: string
  after: string
}

// Reduce a program and return with the reduction for each term in the program.
export const reduceProgram = (program: string, options: Options = {}) => {
  const { terms, defs } = parse(program)
  return terms.map(term => reduceTerm(term, defs, options))
}

// Reduces a term up to its normal form.
let reduceTerm = (term: Term, defs: Definitions, options: Options) => {
  const { maxSteps = 100, strategy = 'normal', etaEnabled = false } = options
  const enough = {}
  const steps: Term[] = []
  let terminates = false
  try {
    reduce(term, { strategy, etaEnabled }, step => {
      if (steps.length >= maxSteps) {
        throw enough
      }
      steps.push(step)
    })
    terminates = true
  } catch (e) {
    if (e !== enough) {
      throw e
    }
    terminates = false
  }

  const last = steps[steps.length - 1] || term
  const finalSynonyms = findSynonyms(last, defs)
  const initial = format(term)
  const final = format(last)
  const totalSteps = steps.length
  const renderStep = (i: number, options: RenderStepOptions) =>
    expandStep(steps[i], options)
  return { initial, final, finalSynonyms, terminates, totalSteps, renderStep }
}
reduceTerm = timed('reduce', reduceTerm)

const expandStep = (t: Term, options: RenderStepOptions = {}) => {
  const step = findStep(t)
  if (!step) {
    throw new Error('Unexpected: term should always have a step')
  }

  let before: Term = step.before
  let after: Term = step.after

  const {
    highlightFormerTerm = identity,
    highlightSubstitutionTerm = identity,
    highlightStep = identity
  } = options

  switch (step.type) {
    case 'alpha':
      before = highlightFunctionVar(
        step.before.body,
        step.before.param,
        highlightFormerTerm
      )
      after = highlightFunctionVar(
        step.after.body,
        step.after.param,
        highlightSubstitutionTerm
      )
      break
    case 'beta':
      const fun = step.before.left as Fun
      const hs = highlight(step.before.right, highlightSubstitutionTerm)
      const ha = highlightFunctionVar(fun.body, fun.param, highlightFormerTerm)
      before = App(ha, hs)
      after = substitute(fun.body, fun.param, hs)
      break
    case 'eta':
    case 'def':
      before = highlight(step.before, highlightFormerTerm)
      after = highlight(step.after, highlightSubstitutionTerm)
      break
  }

  before = highlight(before, highlightStep)
  after = highlight(after, highlightStep)

  const beforeStr = format(replaceStep(t, before))
  const afterStr = format(replaceStep(t, after))

  return { type: step.type, before: beforeStr, after: afterStr }
}

const highlight = (t: Term, fn: StrFun) => {
  const h: StrFun = (t as any).highlight
  const highlight: StrFun = h ? s => fn(h(s)) : fn
  return { ...t, highlight }
}

const highlightFunctionVar = (t: Term, x: string, fn: StrFun) => {
  const hx = highlight(Var(x), fn)
  const ht = substitute(t, x, hx)
  return { ...Fun(x, ht), highlightVar: fn }
}

const findStep = (t: Term): Step | undefined => {
  const { step } = t as any
  if (step) {
    return step
  }

  switch (t.type) {
    case 'fun':
      return findStep(t.body)
    case 'app':
      return findStep(t.left) || findStep(t.right)
  }
}

const replaceStep = (t: Term, replacement: Term): Term => {
  if ((t as any).step) {
    return replacement
  }

  switch (t.type) {
    case 'var':
    case 'def':
      return t
    case 'fun':
      const body = replaceStep(t.body, replacement)
      return t.body === body ? t : Fun(t.param, body)
    case 'app':
      const l = replaceStep(t.left, replacement)
      if (t.left !== l) {
        return App(l, t.right)
      }
      const r = replaceStep(t.right, replacement)
      return t.right === r ? t : App(l, r)
  }
}

const findSynonyms = (term: Term, defs: Definitions) => {
  const synonyms = []
  for (const name in defs) {
    if (alphaEq(term, defs[name])) {
      synonyms.push(name)
    }
  }
  return synonyms
}

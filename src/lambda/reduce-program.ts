import { identity, timeIt } from '../utils'
import { Var, Fun, App, Term } from './terms'
import parse from './parse'
import reduce, { Options as ReduceOptions } from './reduce'
import { substitute } from './substitute'
import format from './format'
import alphaEq from './alpha-eq'
import { Step, Definitions } from './helpers';

type Options = Partial<ReduceOptions> & {
  maxSteps?: number
}

// Reduce a program and return with the reduction for each term in the program.
const reduceProgram = (program: string, options: Options = {}) => {
  let { terms, defs } = parse(program)
  return terms.map(term => reduceTerm(term, defs, options))
}

export default reduceProgram 

// Reduces a term up to its normal form.
let reduceTerm = (term: Term, defs: Definitions, options: Options) => timeIt('reduce', () => {
  const { maxSteps = 100, strategy = 'normal', etaEnabled = false } = options || {}
  let enough = {}
  let steps: Term[] = []
  let terminates = false
  try {
    reduce(term, { strategy, etaEnabled }, step => {
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
  let initial = format(term)
  let final = format(last)
  let totalSteps = steps.length
  let renderStep = (i: number, options: ExpandStepOptions) =>
    expandStep(steps[i], options)
  return { initial, final, finalSynonyms, terminates, totalSteps, renderStep }
})

type StrFun = (s: string) => string

type ExpandStepOptions = {
  highlightFormerTerm?: StrFun,
  highlightSubstitutionTerm?: StrFun,
  highlightStep?: StrFun
}

let expandStep = (t: Term, options: ExpandStepOptions = {}) => {
  let step = findStep(t)
  if (!step) throw new Error('Unexpected: term should always have a step')

  let before: Term = step.before
  let after: Term = step.after

  let {
    highlightFormerTerm = identity,
    highlightSubstitutionTerm = identity,
    highlightStep = identity
  } = options

  switch (step.type) {
  case 'alpha':
    before = highlightFunctionVar(step.before.body, step.before.param, highlightFormerTerm)
    after = highlightFunctionVar(step.after.body, step.after.param, highlightSubstitutionTerm)
    break
  case 'beta':
    let fun = step.before.left as Fun
    let hs = highlight(step.before.right, highlightSubstitutionTerm)
    let ha = highlightFunctionVar(fun.body, fun.param, highlightFormerTerm)
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

  let beforeStr = format(replaceStep(t, before))
  let afterStr = format(replaceStep(t, after))

  return { type: step.type, before: beforeStr, after: afterStr }
}

let highlight = (t: Term, fn: StrFun) => {
  let h: StrFun = (t as any).highlight
  let highlight: StrFun = h ? s => fn(h(s)) : fn
  return Object.assign({}, t, { highlight })
}

let highlightFunctionVar = (t: Term, x: string, fn: StrFun) => {
  let hx = highlight(Var(x), fn)
  let ht = substitute(t, x, hx)
  return Object.assign(Fun(x, ht), {highlightVar: fn})
}

let findStep = (t: Term): Step | undefined => {
  let { step } = t as any 
  if (step) return step

  switch (t.type) {
  case 'fun':
    return findStep(t.body)
  case 'app':
    return findStep(t.left) || findStep(t.right)
  }
}

let replaceStep = (t: Term, replacement: Term): Term => {
  if ((t as any).step) return replacement

  switch (t.type) {
  case 'var':
  case 'def':
    return t
  case 'fun':
    let body = replaceStep(t.body, replacement)
    return t.body === body ? t : Fun(t.param, body)
  case 'app':
    let l = replaceStep(t.left, replacement)
    if (t.left !== l) return App(l, t.right)
    let r = replaceStep(t.right, replacement)
    return t.right === r ? t : App(l, r)
  }
}

let findSynonyms = (term: Term, defs: Definitions) => {
  let synonyms = []
  for (let name in defs) {
    if (alphaEq(term, defs[name])) {
      synonyms.push(name)
    }
  }
  return synonyms
}


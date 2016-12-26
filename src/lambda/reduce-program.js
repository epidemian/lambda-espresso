let {extend, timed, compose, identity} = require('../utils')
let {Var, Fun, App, Def} = require('./terms')
let parse = require('./parse')
let reduce = require('./reduce')
let {substitute} = require('./substitute')
let format = require('./format')
let alphaEq = require('./alpha-eq')

// Reduce a program and return with the reduction for each term in the program.
module.exports = (program, options = {}) => {
  let {terms, defs} = parse(program)
  return terms.map(term => reduceTerm(term, defs, options))
}

// Reduces a term up to its normal form.
let reduceTerm = timed('reduce', (term, defs,
  {maxSteps = 100, strategy = 'normal', etaEnabled = false} = {}) => {
  let enough = {}
  let steps = []
  let terminates = false
  try {
    reduce(term, {strategy, etaEnabled}, step => {
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
  let renderStep = (i, options) =>
    expandStep(steps[i], options)
  return {initial, final, finalSynonyms, terminates, totalSteps, renderStep}
})

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

  before = format(replace(t, stepTerm, before))
  after = format(replace(t, stepTerm, after))

  return {type, before, after}
}

let highlight = (t, fn) => {
  if (t.highlight) fn = compose(fn, t.highlight)
  return extend({}, t, {highlight: fn})
}

let highlightFunctionVar = (t, x, fn) => {
  let hx = highlight(Var(x), fn)
  let ht = substitute(t, x, hx)
  return extend(Fun(x, ht), {highlightVar: fn})
}

let find = (t, fn) => {
  if (fn(t)) return t

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
  if (t === from) return to

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

let findSynonyms = (term, defs) => {
  let synonyms = []
  for (let name in defs) {
    if (alphaEq(term, defs[name])) {
      synonyms.push(name)
    }
  }
  return synonyms
}


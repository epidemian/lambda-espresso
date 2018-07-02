// Script for index.html
let {reduceProgram} = require('./lambda')
let examples = require('./examples').default
let {timeIt, enableLogTimings, dedent} = require('./utils')
let {$, delegate, nodeIndex} = require('./dom')

enableLogTimings()

let input = $('.input')
let output = $('.output')

// Run code on ctrl+enter.
document.addEventListener('keyup', e => {
  if (e.keyCode === 13 && e.ctrlKey) {
    run()
  }
})

input.addEventListener('keyup', () => {
  // Replace every "\" with "λ" while typing.
  let code = input.value
  code = code.replace(/\\/g, 'λ')
  // Preserve selection
  let start = input.selectionStart
  let end = input.selectionEnd
  input.value = code
  input.selectionStart = start
  input.selectionEnd = end
})

$('.run').addEventListener('click', _ => run())

let renderTerm = (term, className = '') =>
  `<span class="term ${className}">${term}</span>`

let renderArrow = (symbol, label) =>
  `<span class=arrow>${symbol}<small>${label}</small></span>`

let renderArrowByType = type => {
  let symbol = type === 'def' ? '≡' : '→'
  let label = arrowSymbols[type] || ''
  return renderArrow(symbol, label)
}

let arrowSymbols = {
  alpha: 'α',
  beta: 'β',
  eta: 'η'
}

let renderSynonyms = synonyms =>
  synonyms.length
    ? `<span class=synonyms>(${synonyms.join(', ')})</span>`
    : ''

let getOptions = () => {
  let maxSteps = parseInt($('input[name=max-steps]').value || 0)
  let strategy = $('input[name=strategy]:checked').value
  let etaEnabled = $('[name=eta-reductions]').checked
  return {maxSteps, strategy, etaEnabled}
}

let reductions = null
let run = () => {
  let code = input.value
  try {
    reductions = reduceProgram(code, getOptions())
    renderReductions()
  } catch (err) {
    output.textContent = err.message
    output.classList.add('error')
  }
}

let renderReductions = () => timeIt('render html', () => {
  output.innerHTML = reductions.map(renderCollapsedReduction).join('')
  output.classList.remove('error')
})

delegate('click', output, '.reduction', element => {
  let reduction = reductions[nodeIndex(element)]
  if (reduction.totalSteps === 0) return
  let expanded = element.querySelector('.expanded')
  let collapsed = element.querySelector('.collapsed')
  if (expanded) {
    expanded.classList.toggle('hidden')
    collapsed.classList.toggle('hidden')
  } else {
    collapsed.classList.add('hidden')
    element.innerHTML += renderExpandedReductionForm(reduction)
  }
})

delegate('mouseover', output, '.expanded .step', element => {
  element.classList.add('highlight')
  // Hide the previous step's after term.
  let prev = element.previousElementSibling
  prev && prev.querySelector('.after').classList.add('hidden')
})

delegate('mouseout', output, '.expanded .step', element => {
  element.classList.remove('highlight')
  let prev = element.previousElementSibling
  prev && prev.querySelector('.after').classList.remove('hidden')
})

let renderCollapsedReduction = reduction =>
  `<div class=reduction>${renderCollapsedReductionForm(reduction)}</div>`

let renderCollapsedReductionForm = reduction => {
  let initial = renderTerm(reduction.initial)
  let arrow = ''
  let final = ''
  if (reduction.totalSteps > 0) {
    arrow = renderArrow('→', `(${reduction.totalSteps})`)
    final = renderTerm(reduction.final)
  }
  let synonyms = renderSynonyms(reduction.finalSynonyms)
  return `<div class=collapsed>${initial} ${arrow} ${final} ${synonyms}</div>`
}

let renderExpandedReductionForm = reduction => {
  let steps = []
  for (let i = 0; i < reduction.totalSteps; i++) {
    let step = reduction.renderStep(i, renderStepOptions)
    let before = renderTerm(step.before, 'before')
    let after = renderTerm(step.after, 'after')
    let arrow = renderArrowByType(step.type)
    let lastStep = i === reduction.totalSteps - 1
    let synonyms = lastStep ? renderSynonyms(reduction.finalSynonyms) : ''
    steps.push(
      `<span class=step>${before}<br>${arrow} ${after} ${synonyms}</span>`
    )
  }

  return `<div class=expanded>${steps.join('')}</div>`
}

let renderStepOptions = {
  highlightStep: str => `<span class=match>${str}</span>`,
  highlightFormerTerm: str => `<span class=former-term>${str}</span>`,
  highlightSubstitutionTerm: str => `<span class=subst-term>${str}</span>`
}

input.value = dedent(`
  ; Write some λ-expressions here and hit Run. Use "\\" to enter "λ" ;)
  (λx.λy.λz.z y x) a b c
`)
input.focus()

let examplesMenu = $('.examples-menu')
let examplesHtml = examples.map((example, i) => {
  let href = encodeURI(`#>${example.code}`)
  return `<li><a href="${href}">${i} - ${example.name}</a></li>`
})

examplesMenu.innerHTML = examplesHtml.join('')
delegate('click', examplesMenu, 'li', (element, event) => {
  event.preventDefault() // Don't change the location.hash
  input.value = examples[nodeIndex(element)].code
  input.scrollTop = 0
})

let examplesDropdown = $('.examples-dropdown')
examplesDropdown.addEventListener('click', e => {
  if (examplesDropdown.classList.contains('active')) return
  e.stopPropagation()
  examplesDropdown.classList.add('active')
  document.addEventListener('click', () => { 
    examplesDropdown.classList.remove('active') 
  }, { once: true })
})

$('button.link').addEventListener('click', () => {
  let code = input.value
  location.hash = `>${code}`
})

let updateInputFromHash = () => {
  let hash = decodeURI(location.hash)
  let codeStart = hash.indexOf('>')
  if (codeStart >= 0) {
    input.value = hash.slice(codeStart + 1)
  }
}

window.addEventListener('hashchange', updateInputFromHash)
updateInputFromHash()

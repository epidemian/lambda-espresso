// Script for index.html
import { $, delegate, nodeIndex } from './dom'
import examples from './examples'
import { Options, reduceProgram, Reduction } from './lambda'
import { dedent, enableLogTimings, timed } from './utils'

enableLogTimings()

const input = $('.input', HTMLTextAreaElement)
const output = $('.output')

// Run code on ctrl+enter.
document.addEventListener('keyup', e => {
  if (e.keyCode === 13 && e.ctrlKey) {
    run()
  }
})

input.addEventListener('beforeinput', event => {
  // Replace every "\" with "λ" while typing.
  if (event.data?.includes('\\')) {
    event.preventDefault()
    const replaced = event.data.replace(/\\/g, 'λ')
    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const value = input.value

    input.value = value.slice(0, start) + replaced + value.slice(end)

    // Update selection
    input.selectionStart = input.selectionEnd = start + 1
  }
})

$('.run').addEventListener('click', _ => run())

const renderTerm = (term: string, className = '') =>
  `<span class="term ${className}">${term}</span>`

const renderArrow = (symbol: string, label: string) =>
  `<span class=arrow>${symbol}<small>${label}</small></span>`

// Only beta and eta steps count as reductions, so use an arrow symbol for them.
// While alpha-renames are more of an equivalence, and thus their symbol.
const arrowSymbols = {
  def: ['≡', ''],
  alpha: ['≡', 'α'],
  beta: ['→', 'β'],
  eta: ['→', 'η']
} as const

const renderSynonyms = (synonyms: string[]) =>
  synonyms.length ? `<span class=synonyms>(${synonyms.join(', ')})</span>` : ''

const getOptions = (): Options => {
  const maxReductionSteps = parseInt(
    $('input[name=max-steps]', HTMLInputElement).value || '0',
    10
  )
  const strategy = $('input[name=strategy]:checked', HTMLInputElement)
    .value as Options['strategy']
  const etaEnabled = $('[name=eta-reductions]', HTMLInputElement).checked
  return { maxReductionSteps, strategy, etaEnabled }
}

let reductions: Reduction[] = []
const run = () => {
  const code = input.value
  try {
    reductions = reduceProgram(code, getOptions())
    renderReductions()
  } catch (err) {
    output.textContent = err instanceof Error ? err.message : String(err)
    output.classList.add('error')
  }
}

const renderReductions = timed('render html', () => {
  output.innerHTML = reductions.map(renderCollapsedReduction).join('')
  output.classList.remove('error')
})

delegate('click', output, '.reduction', element => {
  const reduction = reductions[nodeIndex(element)]
  if (reduction.totalSteps === 0) {
    return
  }
  const expanded = element.querySelector('.expanded')
  const collapsed = element.querySelector('.collapsed')
  if (expanded) {
    expanded.classList.toggle('hidden')
    collapsed?.classList.toggle('hidden')
  } else {
    collapsed?.classList.add('hidden')
    element.innerHTML += renderExpandedReductionForm(reduction)
  }
})

delegate('mouseover', output, '.expanded .step', element => {
  element.classList.add('highlight')
  // Hide the previous step's after term.
  const prev = element.previousElementSibling
  if (prev) {
    prev.querySelector('.after')?.classList.add('hidden')
  }
})

delegate('mouseout', output, '.expanded .step', element => {
  element.classList.remove('highlight')
  const prev = element.previousElementSibling
  if (prev) {
    prev.querySelector('.after')?.classList.remove('hidden')
  }
})

const renderCollapsedReduction = (reduction: Reduction) =>
  `<div class=reduction>${renderCollapsedReductionForm(reduction)}</div>`

const renderCollapsedReductionForm = (reduction: Reduction) => {
  let initial = ''
  let arrow = ''
  if (reduction.reductionSteps > 0) {
    initial = renderTerm(reduction.initial)
    arrow = renderArrow('→', `(${reduction.reductionSteps})`)
  }
  const final = renderTerm(reduction.final, 'final')
  const synonyms = renderSynonyms(reduction.finalSynonyms)
  return `<div class=collapsed>${initial} ${arrow} ${final} ${synonyms}</div>`
}

const renderExpandedReductionForm = (reduction: Reduction) => {
  const steps = []
  for (let i = 0; i < reduction.totalSteps; i++) {
    const isLast = i === reduction.totalSteps - 1
    const step = reduction.renderStep(i, renderStepOptions)
    const before = renderTerm(step.before, 'before')
    const after = renderTerm(step.after, 'after' + (isLast ? ' final' : ''))
    const [arrowSymbol, arrowLabel] = arrowSymbols[step.type]
    const arrow = renderArrow(arrowSymbol, arrowLabel)
    const synonyms = isLast ? renderSynonyms(reduction.finalSynonyms) : ''
    steps.push(
      `<span class=step>${before}<br>${arrow} ${after} ${synonyms}</span>`
    )
  }

  return `<div class=expanded>${steps.join('')}</div>`
}

const renderStepOptions = {
  highlightStep: (s: string) => `<span class=match>${s}</span>`,
  highlightFormerTerm: (s: string) => `<span class=former-term>${s}</span>`,
  highlightSubstitutionTerm: (s: string) => `<span class=subst-term>${s}</span>`
}

input.value = dedent(`
  ; Write some λ-expressions here and hit Run. Use "\\" to enter "λ" ;)
  (λx.λy.λz.z y x) a b c
`)
input.focus()

const examplesMenu = $('.examples-menu')
const examplesHtml = examples.map((example, i) => {
  const href = encodeURI(`#>${example.code}`)
  return `<li><a href="${href}">${i} - ${example.name}</a></li>`
})

examplesMenu.innerHTML = examplesHtml.join('')
delegate('click', examplesMenu, 'li', (element, event) => {
  event.preventDefault() // Don't change the location.hash
  input.value = examples[nodeIndex(element)].code
  input.scrollTop = 0
})

const examplesDropdown = $('.examples-dropdown')
examplesDropdown.addEventListener('click', e => {
  if (examplesDropdown.classList.contains('active')) {
    return
  }
  e.stopPropagation()
  examplesDropdown.classList.add('active')
  document.addEventListener(
    'click',
    () => {
      examplesDropdown.classList.remove('active')
    },
    { once: true }
  )
})

$('button.link').addEventListener('click', () => {
  const code = encodeURIComponent(input.value)
  location.hash = `>${code}`
})

const updateInputFromHash = () => {
  const hash = decodeURIComponent(location.hash)
  const codeStart = hash.indexOf('>')
  if (codeStart >= 0) {
    input.value = hash.slice(codeStart + 1)
  }
}

window.addEventListener('hashchange', updateInputFromHash)
updateInputFromHash()

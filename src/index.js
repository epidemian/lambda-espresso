// Script for index.html
let {reduceProgram} = require('./lambda')
let examples = require('./examples')
let {timed, enableLogTimings, dedent} = require('./helpers')

enableLogTimings()

// Recreate some of jQuery's interface.
let $ = document.querySelector.bind(document)

Node.prototype.on = Node.prototype.addEventListener

// Like jQuery.fn.on(type, selector, handler)
Node.prototype.delegate = function(eventType, selector, handler) {
  this.on(eventType, function(event) {
    let element = event.target
    // Try to find matching element bubbling up from event target.
    while (element !== this) {
      if (element.matches(selector)) {
        handler.call(element, event)
        break
      }
      element = element.parentNode
    }
  })
}

// Like jQuery.fn.one
Node.prototype.once = function(eventType, handler) {
  let onceListener = function(event) {
    handler.call(this, event)
    this.removeEventListener(eventType, onceListener)
  }
  this.on(eventType, onceListener)
}

Node.prototype.index = function() {
  return Array.prototype.indexOf.call(this.parentNode.childNodes, this)
}

let input = $('.input')
let output = $('.output')

// Run code on ctrl+enter.
document.on('keyup', e => {
  if (e.keyCode === 13 && e.ctrlKey)
    run()
})

input.on('keyup', () => {
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

$('.run').on('click', _ => run())

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
  eta: 'η',
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

let renderReductions = timed('render html',  () => {
  let html = reductions.map(renderCollapsedReduction).join('')
  output.innerHTML = html
  output.classList.remove('error')
})

output.delegate('click', '.reduction', function() {
  let reduction = reductions[this.index()]
  if (reduction.totalSteps === 0) return
  let expanded = this.querySelector('.expanded')
  let collapsed = this.querySelector('.collapsed')
  if (expanded) {
    expanded.classList.toggle('hidden')
    collapsed.classList.toggle('hidden')
  } else {
    collapsed.classList.add('hidden')
    this.innerHTML += renderExpandedReductionForm(reduction)
  }
})

output.delegate('mouseover', '.expanded .step', function() {
  this.classList.add('highlight')
  // Hide the previous step's after term.
  let prev = this.previousElementSibling
  prev && prev.querySelector('.after').classList.add('hidden')
})


output.delegate('mouseout', '.expanded .step', function() {
  this.classList.remove('highlight')
  let prev = this.previousElementSibling
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
  highlightSubstitutionTerm: str => `<span class=subst-term>${str}</span>`,
}

input.value = dedent(`
  ; Write some λ-expressions here and hit Run. Use "\\" to enter "λ" ;)
  (λx.λy.λz.z y x) a b c
`)
input.focus()

let examplesMenu = $('.examples-menu')
let examplesHtml = examples.map((example, i) => {
  let hash = `>${example.code}`.replace(/\n/g, '%0A')
  return `<li><a href='//${hash}'>${i} - ${example.name}</a></li>`
})

examplesMenu.innerHTML = examplesHtml.join('')
examplesMenu.delegate('click', 'li', function(e) {
  e.preventDefault() // Don't change the location.hash
  input.value = examples[this.index()].code
  input.scrollTop = 0
})

let examplesDropdown = $('.examples-dropdown')
examplesDropdown.on('click', e => {
  if (examplesDropdown.classList.contains('active')) return
  e.stopPropagation()
  examplesDropdown.classList.add('active')
  document.once('click', () => examplesDropdown.classList.remove('active'))
})

$('button.link').on('click', () => {
  let code = input.value
  location.hash = `>${code}`
})

let updateInputFromHash = () => {
  let hash = decodeURI(location.hash)
  let codeStart = hash.indexOf('>')
  if (codeStart >= 0)
    input.value = hash.slice(codeStart + 1)
}

window.addEventListener('hashchange', updateInputFromHash)
updateInputFromHash()

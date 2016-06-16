# Script for index.html
{reduceProgram} = require './lambda'
examples = require './examples'
{timed, enableLogTimings} = require './helpers'

enableLogTimings()

# Recreate some of jQuery's interface.
$ = document.querySelector.bind document

Node.prototype.on = Node.prototype.addEventListener

# Like jQuery.fn.on(type, selector, handler)
Node.prototype.delegate = (eventType, selector, handler) ->
  @on eventType, (event) ->
    element = event.target
    # Try to find matching element bubbling up from event target.
    while element isnt @
      if element.matches selector
        handler.apply element, arguments
        break
      element = element.parentNode

# Like jQuery.fn.one
Node.prototype.once = (eventType, handler) ->
  onceListener = ->
    handler.apply @, arguments
    @removeEventListener eventType, onceListener
  @on eventType, onceListener

Node.prototype.index = ->
  Array.prototype.indexOf.call @parentNode.childNodes, @

input = $ '.input'
output = $ '.output'

# Run code on ctrl+enter.
document.on 'keyup', (e) ->
  run() if e.keyCode is 13 and e.ctrlKey

input.on 'keyup', (e) ->
  # Replace every "\" with "λ" while typing.
  code = input.value
  code = code.replace /\\/g, 'λ'
  # Preserve selection
  start = input.selectionStart
  end   = input.selectionEnd
  input.value = code
  input.selectionStart = start
  input.selectionEnd   = end

($ '.run').on 'click', -> run()

renderTerm = (term, className = '') ->
  "<span class='term #{className}'>#{term}</span>"

renderArrow = (symbol, label) ->
  "<span class=arrow>#{symbol}<small>#{label}</small></span>"

renderArrowByType = (type) ->
  symbol = if type is 'def' then '≡' else '→'
  label = switch type
    when 'alpha' then 'α'
    when 'beta' then 'β'
    else ''
  renderArrow symbol, label

renderSynonyms = (synonyms) ->
  if synonyms.length
    "<span class=synonyms>(#{synonyms.join ', '})</span>"
  else
    ''

getOptions = ->
  maxSteps = parseInt ($ 'input[name=max-steps]').value or 0
  strategy = ($ 'input[name=strategy]:checked').value
  {maxSteps, strategy}

reductions = null
run = ->
  program = input.value
  try
    reductions = reduceProgram program, getOptions()
    renderReductions()
  catch err
    output.textContent = err.message

  output.classList.toggle 'error', err?

renderReductions = timed 'render html',  ->
  html = (reductions.map renderCollapsedReduction).join ''
  output.innerHTML = html

output.delegate 'click', '.reduction', ->
  reduction = reductions[@index()]
  return if reduction.totalSteps is 0
  expanded = @querySelector '.expanded'
  collapsed = @querySelector '.collapsed'
  if expanded
    expanded.classList.toggle 'hidden'
    collapsed.classList.toggle 'hidden'
  else
    collapsed.classList.add 'hidden'
    @innerHTML += renderExpandedReductionForm reduction

output.delegate 'mouseover', '.expanded .step', ->
  @classList.add 'highlight'
  # Hide the previous step's after term.
  @previousElementSibling?.querySelector('.after').classList.add 'hidden'

output.delegate 'mouseout', '.expanded .step', ->
  @classList.remove 'highlight'
  @previousElementSibling?.querySelector('.after').classList.remove 'hidden'

renderCollapsedReduction = (reduction) ->
  "<div class=reduction>#{renderCollapsedReductionForm reduction}</div>"

renderCollapsedReductionForm = (reduction) ->
  initial = renderTerm reduction.initial
  arrowAndFinal = if reduction.totalSteps > 0
    arrow = renderArrow '→', "(#{reduction.totalSteps})"
    final = renderTerm reduction.final
    "#{arrow} #{final}"
  else
    ''
  synonyms = renderSynonyms reduction.finalSynonyms
  "<div class=collapsed>#{initial} #{arrowAndFinal} #{synonyms}</div>"

renderExpandedReductionForm = (reduction) ->
  steps = for i in [0...reduction.totalSteps]
    step = reduction.renderStep i, renderStepOptions
    before = renderTerm step.before, 'before'
    after = renderTerm step.after, 'after'
    arrow = renderArrowByType step.type
    lastStep = i is reduction.totalSteps - 1
    synonyms = if lastStep then renderSynonyms reduction.finalSynonyms else ''
    "<span class=step>#{before}<br>#{arrow} #{after} #{synonyms}</span>"

  "<div class=expanded>#{steps.join ''}</div>"

renderStepOptions =
  highlightStep: (str) ->
    "<span class=match>#{str}</span>"
  highlightFormerTerm: (str) ->
    "<span class=former-term>#{str}</span>"
  highlightSubstitutionTerm: (str) ->
    "<span class=subst-term>#{str}</span>"


input.value = """
  ; Write some λ-expressions here and hit Run. Use "\\" to enter "λ" ;)
  (λx.λy.λz.z y x) a b c
"""
input.focus()

examplesMenu = $ '.examples-menu'
examplesHtml = for example, i in examples
  hash = ">#{example.code}".replace /\n/g, '%0A'
  "<li><a href='##{hash}'>#{i} - #{example.name}</a></li>"
examplesMenu.innerHTML = examplesHtml.join ''
examplesMenu.delegate 'click', 'li', (e) ->
  e.preventDefault() # Don't change the location.hash
  input.value = examples[@index()].code

examplesDropdown = $ '.examples-dropdown'
examplesDropdown.on 'click', (e) ->
  return if examplesDropdown.classList.contains 'active'
  e.stopPropagation()
  examplesDropdown.classList.add 'active'
  document.once 'click', ->
    examplesDropdown.classList.remove 'active'

($ 'button.link').on 'click', ->
  code = input.value
  location.hash = ">#{code}"

updateInputFromHash = ->
  hash = decodeURI location.hash
  codeStart = hash.indexOf '>'
  if codeStart isnt -1
    code = hash.slice codeStart + 1
    input.value = code

window.addEventListener 'hashchange', updateInputFromHash
updateInputFromHash()

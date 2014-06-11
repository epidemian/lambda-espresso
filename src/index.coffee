# Script for index.html
lambda = require './lambda'
examples = require './examples'
{timed} = require './helpers'

$input           = $ '.input'
$output          = $ '.output'
$outputContainer = $ '.output-container'
$error           = $ '.error'
$errorContainer  = $ '.error-container'

# Run code on ctrl+enter.
($ document).keyup (e) ->
  run() if e.keyCode is 13 and e.ctrlKey

$input.keyup (e) ->
  # Replace every "\" with "λ" while typing.
  code = $input.val()
  code = code.replace /\\/g, 'λ'
  # Preserve selection
  start = $input[0].selectionStart
  end   = $input[0].selectionEnd
  $input.val code
  $input[0].selectionStart = start
  $input[0].selectionEnd   = end

($ '.run').click -> run()

renderTerm = (term, className = '') ->
  "<span class='term #{className}'>#{term}</span>"

renderArrow = (symbol, label) ->
  "<span class=arrow>#{symbol}<small>#{label}</small></span>"

renderArrowByType = (type) ->
  symbol = if type is 'macro' then '≡' else '→'
  label = switch type
    when 'alpha' then 'α'
    when 'beta' then 'β'
    else ''
  renderArrow symbol, label

renderSynonyms = (synonyms) ->
  if synonyms.length
    "(#{synonyms.join ', '})"
  else
    ''

getOptions = ->
  options = {}
  maxSteps = parseInt ($ 'input[name=max-steps]').val()
  options.maxSteps = maxSteps unless isNaN maxSteps
  options

run = ->
  program = $input.val()
  try
    reductions = lambda.reduceProgram program, getOptions()
    renderReductions reductions
  catch err
    $error.text err.message

  $outputContainer.toggle not err?
  $errorContainer.toggle err?

renderReductions = timed 'render html', (reductions) ->
  html = (reductions.map renderCollapsedReduction).join ''
  $output.empty().html html
  $output.off()
  $output.on 'click', '.reduction', ->
    $reduction = $ @
    reduction = reductions[$reduction.index()]
    return if reduction.totalSteps is 0
    if ($reduction.children '.expanded')[0]
      ($ '.collapsed, .expanded', $reduction).toggle()
    else
      $reduction.append renderExpandedReductionForm reduction
      ($ '.collapsed', $reduction).hide()
  $output.on 'mouseenter', '.expanded .step', ->
    $step = $ @
    $step.addClass 'highlight'
    # Hide the previous step's after term.
    $step.prevAll('.step:eq(0)').find('.after').hide()
  $output.on 'mouseleave', '.expanded .step', ->
    $step = $ @
    $step.removeClass 'highlight'
    $step.prevAll('.step:eq(0)').find('.after').show()

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


$input.val """
  ; Write some λ-expressions here. Use "\\" to enter "λ" ;)
  (λx.λy.λz.z y x) a b c
"""
$input.focus()

$examplesMenu = $ '.examples.dropdown-menu'
for example, i in examples
  hash = ">#{example.code}".replace /\n/g, '%0A'
  $examplesMenu.append "<li><a href='##{hash}'>#{i} - #{example.name}</a></li>"
$examplesMenu.on 'click', 'li', (e) ->
  e.preventDefault() # Don't change the location.hash
  $input.val examples[($ @).index()].code

($ 'button.link').click ->
  code = $input.val()
  location.hash = ">#{code}"

updateInputFromHash = ->
  hash = decodeURI location.hash
  codeStart = hash.indexOf '>'
  if codeStart isnt -1
    code = hash.slice codeStart + 1
    $input.val code

($ window).on 'hashchange', updateInputFromHash
updateInputFromHash()

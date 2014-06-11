# Script for index.html
lambda = require './lambda'
examples = require './examples'
{timed} = require './helpers'

$input           = $ '.input'
$output          = $ '.output'
$outputContainer = $ '.output-container'
$error           = $ '.error'
$errorContainer  = $ '.error-container'

preserveScrollPosition = (fn) ->
  top = document.body.scrollTop
  fn()
  document.body.scrollTop = top

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

termHtml = (term, className = '') ->
  "<span class=\"term #{className}\">#{term}</span>"

arrowHtml = (symbol, label) ->
  "<span class=\"arrow\">#{symbol}<small>#{label}</small></span>"

arrowSymbol = (type) ->
  if type is 'macro' then '≡' else '→'

arrowLabel = (type) ->
  switch type
    when 'alpha' then 'α'
    when 'beta' then 'β'
    else ''

arrowHtmlByType = (type) ->
  arrowHtml (arrowSymbol type), (arrowLabel type)

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

synonymsHtml = (synonyms) ->
  if synonyms.length
    " (#{synonyms.join ', '})"
  else
    ''

renderReductions = timed 'render html', (reductions) ->
  result = ''
  for {initial, final, finalSynonyms, totalSteps} in reductions
    result += '<div class="reduction">'

    # Collapsed form (TODO Maybe use Bootstrap's Collapse component).
    collapsed = if not totalSteps
      termHtml initial
    else
      (termHtml initial) + ' ' + (arrowHtml '→', "(#{totalSteps})") + ' ' +
      (termHtml final)
    collapsed += synonymsHtml finalSynonyms

    result += "<div class=\"collapsed\">#{collapsed}</div>"

    result += '</div>' # /.reduction

  $output.empty().html result
  $output.off()
  $output.on 'click', '.reduction', ->
    $reduction = $ @
    reduction = reductions[$reduction.index()]
    return if reduction.totalSteps is 0
    if not ($reduction.children '.expanded')[0]
      $reduction.append renderExpandedReduction reduction
      ($ '.collapsed', $reduction).hide()
    else
      ($ '.collapsed, .expanded', $reduction).toggle()
  $output.on 'mouseenter', '.expanded .step', ->
    $step = $ @
    $step.addClass 'highlight'
    # Hide the previous step's after term.
    $step.prevAll('.step:eq(0)').find('.after').hide()
  $output.on 'mouseleave', '.expanded .step', ->
    $step = $ @
    $step.removeClass 'highlight'
    $step.prevAll('.step:eq(0)').find('.after').show()

renderExpandedReduction = ({totalSteps, initial, renderStep, finalSynonyms}) ->
  expanded = '<div class="expanded">'
  for i in [0...totalSteps]
    {type, before, after} = renderStep i, renderStepOptions
    step = (termHtml before, 'before') + '<br>' +
      (arrowHtmlByType type) + (termHtml after, 'after')
    step += synonymsHtml finalSynonyms if i is totalSteps - 1
    expanded += "<span class=step>#{step}</span>"
  expanded += '</div>'
  expanded

renderStepOptions =
  highlightStep: (str) ->
    "<span class=\"match\">#{str}</span>"
  highlightFormerTerm: (str) ->
    "<span class=\"former-term\">#{str}</span>"
  highlightSubstitutionTerm: (str) ->
    "<span class=\"subst-term\">#{str}</span>"


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

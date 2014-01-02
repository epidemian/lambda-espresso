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

renderReductions = timed 'render html', (reductions) ->
  result = ''
  for {initial, final, steps} in reductions
    result += '<div class="reduction">'

    # Collapsed form (TODO Maybe use Bootstrap's Collapse component).
    collapsed = if not steps.length
      termHtml initial
    else
      (termHtml initial) + ' ' + (arrowHtml '→', "(#{steps.length})") + ' ' +
      (termHtml final)
    result += "<div class=\"collapsed\">#{collapsed}</div>"

#    # Expanded form.
#    result += '<div class="expanded">'
#    if not steps.length
#      result += termHtml initial
#    else
#      for {type, before, after} in steps
#        result += '<span class="step">' + (termHtml before, 'before') + '<br>' +
#        (arrowHtmlByType type) + (termHtml after, 'after') + '</span>'
#    result += '</div>' # /.expanded

    result += '</div>' # /.reduction
  $output.empty().html result
  updateOutputExpansions()
  ($ '.reduction', $output).click ->
    preserveScrollPosition =>
      ($ '.collapsed, .expanded', @).toggle()
  ($ '.expanded .step', $output).hover ->
    $step = $ @
    $step.addClass 'highlight'
    $step.prevAll('.step:eq(0)').find('.after').hide()
  , ->
    $step = $ @
    $step.removeClass 'highlight'
    # Hide the previous step's after term.
    $step.prevAll('.step:eq(0)').find('.after').show()

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

options =
  expandOutput: no

updateOutputExpansions = ->
  preserveScrollPosition ->
    expand = options.expandOutput
    ($ '.expand-all, .reduction .collapsed').toggle not expand
    ($ '.collapse-all, .reduction .expanded').toggle expand

($ '.expand-all, .collapse-all'). click ->
  options.expandOutput = not options.expandOutput
  updateOutputExpansions()


# Script for index.html
lambda = require './lambda'
examples = (require './examples').all

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

run = ->
  program = $input.val()
  try
    reductions = lambda.reduceProgram program
    result = ''
    for steps in reductions
      result += '<div class="reduction">'

      first = steps[0]
      last = steps[steps.length - 1]

      # Collapsed form (TODO Maybe use Bootstrap's Collapse component).
      result += "<div class=\"collapsed\">#{first} → <b>#{last}</b></div>"

      # Expanded form.
      result += '<div class="expanded">'
      result += "<b>#{first}</b><br>"
      for step, i in steps
        continue if i is 0 and steps.length > 1
        step = "<b>#{step}</b>" if i is steps.length - 1
        result += " → #{step}<br>"
      result += '</div>' # /.expanded

      result += '</div>' # /.reduction
    $output.empty().html result
    updateOutputExpansions()
    ($ '.reduction', $output).click ->
      ($ '.collapsed, .expanded', @).toggle()
  catch e
    $error.text e.message

  $outputContainer.toggle result?
  $errorContainer.toggle not result?

$input.val """
  ; Write some λ-expressions here. Use "\\" to enter "λ" ;)
  (λx.λy.λz.z y x) a b c
"""
$input.focus()

$examplesMenu = $ '.examples.dropdown-menu'
examples.forEach (example) ->
  hash = ">#{example.code}".replace /\n/g, '%0A'
  $li = $ """<li><a href="##{hash}">#{example.name}</a></li>"""
  $li.click (e) ->
    e.preventDefault() # Don't change the location.hash
    $input.val example.code
  $examplesMenu.append $li

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
  expand = options.expandOutput
  ($ '.expand-all, .reduction .collapsed').toggle not expand
  ($ '.collapse-all, .reduction .expanded').toggle expand

($ '.expand-all, .collapse-all'). click ->
  options.expandOutput = not options.expandOutput
  updateOutputExpansions()


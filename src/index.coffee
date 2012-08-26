# Script for index.html
lambda = require './lambda'

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
      for step, i in steps
        result += ' → ' if i > 0
        result += if i < steps.length - 1 then step else "<b>#{step}</b>"
        result += '<br>'
    $output.empty().html result
  catch e
    $error.text e.message

  $outputContainer.toggle result?
  $errorContainer.toggle not result?

$input.val """
; Write some λ-expressions here. Use "\\" to enter "λ" ;)
(λx.λy.λz.z y x) a b c
"""
$input.focus()
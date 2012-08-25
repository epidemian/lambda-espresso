# Script for index.html
lambda = require './lambda'

$input           = $ '.input'
$output          = $ '.output'
$outputContainer = $ '.output-container'
$error           = $ '.error'
$errorContainer  = $ '.error-container'

$input.keyup (e) ->
  return run() if e.keyCode is 13 and e.ctrlKey

  # Replace every "\" with "λ" while typing.
  code = $input.val()
  code = code.replace /\\/g, 'λ'
  $input.val code

($ '.run').click -> run()

run = ->
  console.log 'run!'
  expr = $input.val()
  try
    steps = lambda.reductionSteps expr
    result = ''
    for step, i in steps
      result += '<br> → ' if i > 0
      result += if i < steps.length - 1 then step else "<b>#{step}</b>"
    $output.empty().html result
  catch e
    $error.text e.message

  $outputContainer.toggle result?
  $errorContainer.toggle not result?

$input.focus()
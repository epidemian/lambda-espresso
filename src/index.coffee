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
  expr = $input.val()
  try
    result = lambda.reduce expr
    $output.text "#{expr} → #{result}"
  catch e
    $error.text e.message

  $outputContainer.toggle result?
  $errorContainer.toggle not result?
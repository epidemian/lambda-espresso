{spawn} = require 'child_process'
fs = require 'fs'

run = (cmd, args = []) ->
  spawn cmd, args, stdio: 'inherit'

task 'watch:coffee', 'compile coffee source files everytime they change', ->
  run 'coffee', ['-wco', 'lib', 'src']

task 'watch:test', 'run tests everytime source files or test files change', ->
  run 'mocha', ['-w', '--reporter', 'min', '--growl']

task 'watch:grammar', 'compile Jison grammar file everytime it changes', ->
  compileGrammar = ->
    console.log 'Compiling grammar file'
    run 'jison', ['src/grammar.jison', '-o', 'lib/grammar.js']
  compileGrammar()
  fs.watchFile 'src/grammar.jison', (curr, prev) ->
    compileGrammar() if +curr.mtime isnt +prev.mtime

task 'watch', 'compile source files and run tests everytime source files change', ->
  invoke task for task in ['watch:coffee', 'watch:test', 'watch:grammar']



task 'test', 'run tests', ->
  run 'mocha'
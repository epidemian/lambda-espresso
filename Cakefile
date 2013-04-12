{spawn} = require 'child_process'
fs = require 'fs'

run = (cmd, args = []) ->
  spawn cmd, args, stdio: 'inherit'

task 'watch:coffee', 'compile coffee source files everytime they change', ->
  run 'coffee', ['-wco', 'lib', 'src']

task 'watch:grammar', 'compile Jison grammar file everytime it changes', ->
  # Use Nodemon to watch grammar file and run Jison on every change.
  run 'nodemon', '-q -w src/grammar.jison -x jison src/grammar.jison -o lib/grammar.js'.split ' '

task 'watch:test', 'run tests everytime source files or test files change', ->
  invoke 'watch:coffee'
  invoke 'watch:grammar'
  run 'mocha', ['--watch', '--reporter', 'min', '--growl']

task 'watch:index', 're-build merged index.js file everytime a source file changes', ->
  invoke 'watch:coffee'
  invoke 'watch:grammar'
  # Use Nodemon to watch lib directory and invoke build:index on every change.
  run 'nodemon', '-q -w lib/ -x cake build:index'.split ' '

task 'build:index', 'build a merged script, index.js, to include in index.html', ->
  run 'browserify', 'lib/index.js -o assets/index.js'.split ' '

task 'test', 'run tests', ->
  run 'mocha'
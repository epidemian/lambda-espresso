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
    compileGrammar() if curr.mtime.getTime() > prev.mtime.getTime()

task 'watch', 'compile source files and run tests everytime source files change', ->
  invoke "watch:#{task}" for task in ['coffee', 'test', 'grammar']

task 'build', 'build a merged script to include in index.html', ->
  # Code shamelessly stolen from jashkenas/coffee-script.
  # TODO Use some fancy build tool like Brunch (http://brunch.io/)
  moduleSources = for name in ['grammar', 'lambda', 'index']
    """
      require['./#{name}'] = new function() {
        var exports = this;
        #{fs.readFileSync "lib/#{name}.js"}
      };
    """
  code = """
    // This is a generated file. Sources are here: https://github.com/epidemian/lambda-playground
    (function() {
      function require(path){ return require[path]; }
      #{moduleSources.join '\n'}
    }());
  """
  fs.writeFileSync 'assets/index.js', code

task 'test', 'run tests', ->
  run 'mocha'
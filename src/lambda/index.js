let {Var, Fun, App, Def} = require('./terms')
let parse = require('./parse')
let format = require('./format')
let reduceProgram = require('./reduce-program')

module.exports = {
  Var, Fun, App, Def,
  parse, format, reduceProgram,
}
let {Fun, App} = require('./terms')
let {extend} = require('../utils')

// Compose a function with a term constructor.
exports.composeFun = (fn, x) => (b) => fn(Fun(x, b))
exports.composeAppL = (fn, l) => (r) => fn(App(l, r))
exports.composeAppR = (fn, r) => (l) => fn(App(l, r))

// Mark a reduction step on the `after` term.
exports.markStep = (type, before, after) =>
  extend({}, after, {step: {type, before}})

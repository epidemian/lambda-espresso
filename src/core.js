// Term types/constructors.
let Var = name => ({type: Var, name})
let Fun = (param, body) => ({type: Fun, param, body})
let App = (left, right) => ({type: App, left, right})
let Def = (name, term) => ({type: Def, name, term})

module.exports = {Var, Fun, App, Def}

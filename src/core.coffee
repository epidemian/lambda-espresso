# Term types/constructors.
Var = (name) -> {type: Var, name}
Fun = (param, body) -> {type: Fun, param, body}
App = (left, right) -> {type: App, left, right}
Def = (name, term) -> {type: Def, name, term}

module.exports = {Var, Fun, App, Def}

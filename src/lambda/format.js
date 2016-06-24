let {Var, Fun, App, Def} = require('./terms')
let {identity} = require('../utils')

// Returns the string representation for a given term t.
let format = (t, appParens = false, funParens = false) => {
  let h = t.highlight || identity
  switch (t.type) {
  case Var:
  case Def:
    return h(t.name)
  case Fun:
    let lambda = `λ${t.param}`
    if (t.highlightVar) lambda = t.highlightVar(lambda)
    let funStr = `${lambda}.${format(t.body)}`
    return h(funParens ? `(${funStr})` : funStr)
  case App:
    let lStr = format(t.left, false, true)
    let rStr = format(t.right, true, funParens)
    let appStr = `${lStr} ${rStr}`
    return h(appParens ? `(${appStr})` : appStr)
  }
}

module.exports = format

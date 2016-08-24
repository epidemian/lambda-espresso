let {Var, Fun, App, Def} = require('./terms')

// Whether the variable x appears free in the term t.
let freeIn = (x, t) => {
  switch (t.type) {
  case Var:
    return t.name === x
  case Fun:
    return t.param !== x && freeIn(x, t.body)
  case App:
    return freeIn(x, t.left) || freeIn(x, t.right)
  case Def:
    // Definitions don't have free variables.
    return false
  }
}

module.exports = freeIn

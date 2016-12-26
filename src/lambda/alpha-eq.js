let {Var, Fun, App, Def} = require('./terms')
let {substitute} = require('./substitute')

// Whether two terms are alpha-equivalent.
let alphaEq = (t1, t2) => {
  if (t1.type === Def) return alphaEq(t1.term, t2)
  if (t2.type === Def) return alphaEq(t1, t2.term)
  if (t1.type !== t2.type) return false
  switch (t1.type) {
  case Var:
    return t1.name === t2.name
  case Fun:
    if (t1.param === t2.param) {
      return alphaEq(t1.body, t2.body)
    } else {
      return alphaEq(t1.body, substitute(t2.body, t2.param, Var(t1.param)))
    }
  case App:
    return alphaEq(t1.left, t2.left) && alphaEq(t1.right, t2.right)
  }
}

module.exports = alphaEq

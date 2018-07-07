import { substitute } from './substitute'
import { Term, Var } from './terms'

// Whether two terms are alpha-equivalent.
const alphaEq = (t1: Term, t2: Term): boolean => {
  if (t1.type === 'def') {
    return alphaEq(t1.term, t2)
  }
  if (t2.type === 'def') {
    return alphaEq(t1, t2.term)
  }
  if (t1.type === 'var' && t2.type === 'var') {
    return t1.name === t2.name
  }
  if (t1.type === 'app' && t2.type === 'app') {
    return alphaEq(t1.left, t2.left) && alphaEq(t1.right, t2.right)
  }
  if (t1.type === 'fun' && t2.type === 'fun') {
    if (t1.param === t2.param) {
      return alphaEq(t1.body, t2.body)
    } else {
      return alphaEq(t1.body, substitute(t2.body, t2.param, Var(t1.param)))
    }
  }
  return false
}

export default alphaEq

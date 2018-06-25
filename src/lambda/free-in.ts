import { Term } from './terms'

// Whether the variable x appears free in the term t.
const freeIn = (x: string, t: Term): boolean => {
  switch (t.type) {
  case 'var':
    return t.name === x
  case 'fun':
    return t.param !== x && freeIn(x, t.body)
  case 'app':
    return freeIn(x, t.left) || freeIn(x, t.right)
  case 'def':
    // Definitions don't have free variables.
    return false
  }
}

export default freeIn
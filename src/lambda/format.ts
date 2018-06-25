import { Term } from './terms'
import { identity } from '../utils'

// Returns the string representation for a given term t.
const format = (t: Term, appParens = false, funParens = false): string => {
  // TODO: Remove highlighting hack of storing data on terms.
  let { highlight: h = identity, highlightVar } = t as any
  switch (t.type) {
  case 'var':
  case 'def':
    return h(t.name)
  case 'fun':
    let lambda = `λ${t.param}`
    if (highlightVar) lambda = highlightVar(lambda)
    let funStr = `${lambda}.${format(t.body)}`
    return h(funParens ? `(${funStr})` : funStr)
  case 'app':
    let lStr = format(t.left, false, true)
    let rStr = format(t.right, true, funParens)
    let appStr = `${lStr} ${rStr}`
    return h(appParens ? `(${appStr})` : appStr)
  }
}

export default format

import { identity } from '../utils'
import { Term } from './terms'

// Returns the string representation for a given term t.
const format = (t: Term, appParens = false, funParens = false): string => {
  // TODO: Remove highlighting hack of storing data on terms.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { highlight: h = identity, highlightVar } = t as any
  switch (t.type) {
    case 'var':
    case 'def':
      return h(t.name)
    case 'fun':
      let lambda = `λ${t.param}`
      if (highlightVar) {
        lambda = highlightVar(lambda)
      }
      const funStr = `${lambda}.${format(t.body)}`
      return h(funParens ? `(${funStr})` : funStr)
    case 'app':
      const lStr = format(t.left, false, true)
      const rStr = format(t.right, true, funParens)
      const appStr = `${lStr} ${rStr}`
      return h(appParens ? `(${appStr})` : appStr)
  }
}

export default format

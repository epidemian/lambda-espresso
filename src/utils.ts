let logTimings = false

export const timed =
  <Args extends unknown[], R>(name: string, fn: (...args: Args) => R) =>
  (...args: Args) => {
    if (logTimings) {
      console.time(name)
    }
    const res = fn(...args)
    if (logTimings) {
      console.timeEnd(name)
    }
    return res
  }

export const enableLogTimings = () => {
  logTimings = true
}
export const disableLogTimings = () => {
  logTimings = false
}

export const identity = <T>(x: T) => x

// Note: it would be nice to replace this overly-clever function with
// String.dedent() once it gets standardized. See https://github.com/tc39/proposal-string-dedent
export const dedent = (str: string) => {
  const match = str.match(/^[ \t]*(?=\S)/gm)
  if (!match) {
    return str
  }

  const indent = Math.min(...match.map(x => x.length))
  const re = new RegExp(`^[ \\t]{${indent}}`, 'gm')
  const unindented = indent > 0 ? str.replace(re, '') : str

  return unindented.trim()
}

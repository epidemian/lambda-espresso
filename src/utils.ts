let logTimings = false

// TODO: Maybe this could be a function decorator?
export const timeIt = <T>(name: string, fn: () => T) => {
  logTimings && console.time(name)
  let res = fn()
  logTimings && console.timeEnd(name)
  return res
}

export const enableLogTimings = () => {
  logTimings = true
}
export const disableLogTimings = () => {
  logTimings = false
}

export const identity = <T>(x: T) => x

// TODO: Maybe this could be a tagged template string function :)
export const dedent = (str: string) => {
  let match = str.match(/^[ \t]*(?=\S)/gm)

  if (!match) return str

  let indent = Math.min(...match.map(x => x.length))
  let re = new RegExp(`^[ \\t]{${indent}}`, 'gm')
  let unindented = indent > 0 ? str.replace(re, '') : str

  return unindented.trim()
}

export const collapseWhitespace = (str: string) => str.replace(/\s+/gm, ' ')

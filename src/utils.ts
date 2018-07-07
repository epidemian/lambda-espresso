let logTimings = false

// TODO: Maybe this could be a function decorator?
export const timeIt = <T>(name: string, fn: () => T) => {
  if (logTimings) {
    console.time(name)
  }
  const res = fn()
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

// TODO: Maybe this could be a tagged template string function :)
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

export const collapseWhitespace = (str: string) => str.replace(/\s+/gm, ' ')

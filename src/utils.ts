export const extend = Object.assign

let logTimings = false
export const timed = (name: string, fn: Function) => (...args: any[]) => 
  timeIt(name, () => fn(...args))


export const timeIt = <T>(name: string, fn: () => T) => {
  logTimings && console.time(name)
  let res = fn()
  logTimings && console.timeEnd(name)
  return res
}

export const enableLogTimings = () => { logTimings = true }
export const disableLogTimings = () => { logTimings = false }

export const compose = (f: Function, g: Function) => (x: any) => f(g(x))

export const identity = <T>(x: T) => x

export const dedent = (str: string) => {
  let match = str.match(/^[ \t]*(?=\S)/gm)

  if (!match) return str

  let indent = Math.min(...match.map(x => x.length))
  let re = new RegExp(`^[ \\t]{${indent}}`, 'gm')
  let unindented = indent > 0 ? str.replace(re, '') : str

  return unindented.trim()
}

export const collapseWhitespace = (str: string) => str.replace(/\s+/gm, ' ')

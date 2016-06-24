exports.extend = Object.assign || ((obj, ...srcs) => {
  srcs.forEach(src => {
    for (let k in src)
      obj[k] = src[k]
  })
  return obj
})

let logTimings = false
exports.timed = (name, fn) => (...args) => {
  logTimings && console.time(name) // eslint-disable-line no-console
  let res = fn(...args)
  logTimings && console.timeEnd(name) // eslint-disable-line no-console
  return res
}

exports.enableLogTimings = () => { logTimings = true }
exports.disableLogTimings = () => { logTimings = false }

exports.compose = (f, g) => (x) => f(g(x))

exports.identity = x => x

exports.dedent = str => {
  let match = str.match(/^[ \t]*(?=\S)/gm)

  if (!match)
    return str

  let indent = Math.min(...match.map(x => x.length))
  let re = new RegExp(`^[ \\t]{${indent}}`, 'gm')
  let unindented = indent > 0 ? str.replace(re, '') : str

  return unindented.trim()
}

exports.collapseWhitespace = str => str.replace(/\s+/gm, ' ')

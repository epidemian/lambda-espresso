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

exports.dedent = str => str.replace(/^\s+/gm, '').trim()

exports.cleanWhitespace = str => str.replace(/\s+/gm, ' ')

exports.extend = Object.assign or (obj, srcs...) ->
  for src in srcs
    obj[k] = v for k, v of src
  obj

logTimings = no
exports.timed = (name, fn) ->
  (args...) ->
    console.time name if logTimings
    res = fn args...
    console.timeEnd name if logTimings
    res

exports.enableLogTimings = -> logTimings = yes
exports.disableLogTimings = -> logTimings = no

exports.compose = (f, g) -> (x) -> f g x

exports.identity = (x) -> x

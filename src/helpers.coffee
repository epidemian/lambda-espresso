exports.repeatStr = (str, n) ->
  res = ''
  res += str while n--
  res

exports.extend = (obj, srcs...) ->
  for src in srcs
    obj[k] = v for k, v of src
  obj

exports.timed = (name, fn) ->
  (args...) ->
    console.time name
    res = fn args...
    console.timeEnd name
    res

exports.compose = (f, g) -> (x) -> f g x

exports.identity = (x) -> x
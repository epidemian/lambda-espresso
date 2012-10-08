exports.repeatStr = (str, n) ->
  res = ''
  res += str while n--
  res

exports.extend = (obj, srcs...) ->
  for src in srcs
    obj[k] = v for k, v of src
  obj

exports.compose = (fns...) ->
  (args...) ->
    for fn in fns
      args = [fn args...]
    args[0]
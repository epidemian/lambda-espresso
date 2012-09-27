exports.repeatStr = (str, n) ->
  res = ''
  res += str while n--
  res

exports.extend = (obj, src) ->
  obj[k] = v for k, v of src
  obj
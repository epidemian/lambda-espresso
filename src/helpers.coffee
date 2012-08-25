# A useful function to trace some method's execution.
Function::trace = do ->
  traceEnabled = yes

  # Global indentation level.
  indent = 0

  # Log indented messages.
  log = (msg) ->
    ind = ''
    for i in [0...indent] then ind += '| '
    console.log "#{ind}#{msg}"

  makeTracing = (name, fn) ->
    (args...) ->
      log "(#{@}).#{name}(#{args.join ', '})"
      indent++
      res = fn.apply @, args
      indent--
      log "-> #{res}"
      res

  (arg) ->
    for own name, fn of arg
      @prototype[name] = if traceEnabled then makeTracing name, fn else fn
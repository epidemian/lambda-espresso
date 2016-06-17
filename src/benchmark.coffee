{reduceProgram} = require './lambda'
{enableLogTimings} = require './helpers'

enableLogTimings()

makeTerm = (n) ->
  "λs.λz.#{'(s '.repeat n}z#{')'.repeat n}"

factorial = (n) ->
  if n == 0 then 1 else n * factorial n - 1

num = 4

code = """
  one = λs.λz.s z
  true = λt.λf.t
  false = λt.λf.f
  and = λp.λq.p q p
  if = λp.λq.λr.p q r
  pred = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)
  sub = λm.λn.n pred m
  mult = λm.λn.λs.m (n s)
  zero? = λn.n (λx.false) true
  eq = λm.λn.and (zero? (sub m n)) (zero? (sub n m))
  Y = λf.(λx.f (x x)) (λx.f (x x))
  fact = Y λr.λn.if (zero? n) one (mult n (r (pred n)))
  eq (fact #{makeTerm num}) #{makeTerm factorial num}
"""

console.log "calculating #{num}! == #{factorial num}"
reductions = reduceProgram code, maxSteps: 100000

console.log 'steps:', reductions[0].totalSteps
console.log 'ok:', reductions[0].final in ['true', 'λt.λf.t']

let {reduceProgram} = require('./lambda')
let {enableLogTimings} = require('./utils')

enableLogTimings()

let makeTerm = n =>
  `λs.λz.${'(s '.repeat(n)}z${')'.repeat(n)}`

let factorial = n =>
  n === 0 ? 1 : n * factorial(n - 1)

let num = 4

let code = `
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
  eq (fact ${makeTerm(num)}) ${makeTerm(factorial(num))}
`

/* eslint-disable no-console */
console.log(`calculating ${num}! == ${factorial(num)}`)
let [{totalSteps, final}] = reduceProgram(code, {maxSteps: 100000})

console.log('steps:', totalSteps)
console.log('ok:', final === 'true' || final === 'λt.λf.t')

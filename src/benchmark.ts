import assert from 'node:assert/strict'
import { reduceProgram } from './lambda'
import { enableLogTimings } from './utils'

enableLogTimings()

const N = 10
const fib = (n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2))
const lambdaNum = (n: number) => `λs.λz.${'(s '.repeat(n)}z${')'.repeat(n)}`

const code = `
  true = λt.λf.t
  false = λt.λf.f
  and = λp.λq.p q p
  pred = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)
  add = λm.λn.λs.λz.m s (n s z)
  sub = λm.λn.n pred m
  zero? = λn.n (λx.false) true
  eq = λm.λn.and (zero? (sub m n)) (zero? (sub n m))
  Y = λf.(λx.f (x x)) (λx.f (x x))
  fib = Y λfib.λn.(zero? (pred n)) n (add (fib (pred n)) (fib (pred (pred n))))
  eq (fib ${lambdaNum(N)}) (${lambdaNum(fib(N))})
`

console.log(`calculating fib(${N}) == ${fib(N)}`)
const [{ reductionSteps, totalSteps, final }] = reduceProgram(code, {
  maxReductionSteps: 1_000_000
})

console.log('reductions:', reductionSteps)
console.log('total steps:', totalSteps)
assert.equal(final, 'λt.λf.t')

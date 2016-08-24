let assert = require('assert')
let {parse, format} = require('../src/lambda')

let assertFormat = (str, expected) => {
  let {terms} = parse(str)
  assert.equal(terms.length, 1)
  assert.equal(format(terms[0]), expected)
}

describe('format()', () => {
  it('respects operations\' precedence when applying parentheses', () => {
    assertFormat('λa.a λb.b λc.c λd.d', 'λa.a λb.b λc.c λd.d')
    assertFormat('(λa.a) (λb.b) (λc.c) λd.d', '(λa.a) (λb.b) (λc.c) λd.d')
    assertFormat('(((λa.a) λb.b) λc.c) λd.d', '(λa.a) (λb.b) (λc.c) λd.d')
    assertFormat('λa.a (λb.b (λc.c (λd.d)))', 'λa.a λb.b λc.c λd.d')
  })
})

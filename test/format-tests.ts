import assert from 'assert'
import { format, parse } from '../src/lambda'

const assertFormat = (str: string, expected: string) => {
  const { terms } = parse(str)
  assert.equal(terms.length, 1)
  assert.equal(format(terms[0]), expected)
}

describe('format()', () => {
  it("respects operations' precedence when applying parentheses", () => {
    assertFormat('λa.a λb.b λc.c λd.d', 'λa.a λb.b λc.c λd.d')
    assertFormat('(λa.a) (λb.b) (λc.c) λd.d', '(λa.a) (λb.b) (λc.c) λd.d')
    assertFormat('(((λa.a) λb.b) λc.c) λd.d', '(λa.a) (λb.b) (λc.c) λd.d')
    assertFormat('λa.a (λb.b (λc.c (λd.d)))', 'λa.a λb.b λc.c λd.d')
  })
})

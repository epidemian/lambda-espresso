import assert from 'assert'
import { Options, reduceProgram } from '../src/lambda'

const reduceTerm = (str: string, options?: Options) => {
  const reductions = reduceProgram(str, options)
  assert.equal(reductions.length, 1)
  return reductions[0]
}

const assertReduce = (expr: string, expected: string, options?: Options) => {
  assert.strictEqual(reduceTerm(expr, options).final, expected)
}

const assertReduceSteps = (expr: string, expectedSteps: string[]) => {
  const { totalSteps, renderStep } = reduceTerm(expr)
  const actualSteps = Array.from({ length: totalSteps }).map((_, i) => {
    const { before, after } = renderStep(i)
    return `${before} -> ${after}`
  })
  assert.deepStrictEqual(actualSteps, expectedSteps)
}

describe('reduceProgram()', () => {
  it('does not reduce simple irreducible expressions', () => {
    assertReduce('x', 'x')
    assertReduce('x y', 'x y')
    assertReduce('λx.x', 'λx.x')
  })

  it('reduces simple beta-redexes', () => {
    assertReduce('(λx.x) y', 'y')
    assertReduce('(λx.x y) z', 'z y')
    assertReduce('(λx.x y) y', 'y y')
    assertReduce('(λx.x x) y', 'y y')
  })

  it('reduces multiple beta-redex', () => {
    assertReduce('(λx.λy.x y) v w', 'v w')
  })

  it('reduces a beta-redex that is formed only after a reduction', () => {
    assertReduce('(λx.x y) (λz.z z)', 'y y')
  })

  it('does at most maxReductionSteps reduction steps', () => {
    const { totalSteps, reductionSteps } = reduceTerm('(λx.x x) (λx.x x)', {
      maxReductionSteps: 42
    })
    assert.equal(reductionSteps, 42)
    assert.equal(totalSteps, 42)
  })

  it('indicates when a reduction terminates', () => {
    const { terminates } = reduceTerm('(λx.x) y')
    assert(terminates)
  })

  it('indicates when a reduction does not terminate', () => {
    const { terminates } = reduceTerm('(λx.x x) (λx.x x)')
    assert(!terminates)
  })

  it('can reduce by eta-conversions', () => {
    assertReduce('λx.f x', 'λx.f x')
    assertReduce('λx.f x', 'f', { etaEnabled: true })
    assertReduce('λs.λz.s z', 'λs.s', { etaEnabled: true })
    assertReduce('λx.y z x', 'y z', { etaEnabled: true })
  })

  describe('alpha-renaming in substitution (λy.T)[x := S]', () => {
    it('renames when y is free in S and x is free in T', () => {
      assertReduce('(λx.λy.x y) (y z)', 'λy1.y z y1')
    })

    it('does not rename if y does not occur free in S but x is free in T', () => {
      assertReduce('(λx.λy.x y) (w z)', 'λy.w z y')
    })

    it('does not rename if y is free in S but x does not occur in T', () => {
      assertReduce('(λx.λy.y) (y z)', 'λy.y')
    })

    it('does not rename if y is free in S but x occurs always bound on T', () => {
      assertReduce('(λx.λy.y λx.x) (y z)', 'λy.y λx.x')
      assertReduce('(λx.λy.y λx.x x y λx.x) (y z)', 'λy.y λx.x x y λx.x')
    })

    it('does not choose a name that makes an inner variable bind to another abstraction', () => {
      // In this case, λy.λy1.x y y1 must be renamed, but it cannot choose to
      // use [y := y1] because it would make the inner y bind to the second
      // abstraction instead of the first one.
      assertReduce('(λx.λy.λy1.x y) y', 'λy2.λy1.y y2')
      // Same thing as above but with higher numbers.
      assertReduce('(λx.λy4.λy5.x y4) y4', 'λy6.λy5.y4 y6')
      // Same idea, but here it has to go quite deep to find a new name.
      assertReduce('(λx.λy.λy1.λy2.λy3.λy4.x y) y', 'λy5.λy1.λy2.λy3.λy4.y y5')
    })

    it('does not choose a name that collides with free variables', () => {
      assertReduce('(λx.λy.x y y1) y', 'λy2.y y2 y1')
    })

    it('does not choose a name that collides in any form', () => {
      // This test combines the other three criteria. y can't be renamed to y1
      // or y4 because it would collide with free variables; nor renamed to y2
      // or y5 because it would make y bind to an inner abstraction; not renamed
      // to y3 or y6 because they are free in the substitution term.
      assertReduce(
        '(λx.λy.λy2.λy5.x y y1 y4) (y y3 y6)',
        'λy7.λy2.λy5.y y3 y6 y7 y1 y4'
      )
    })

    it('performs more than one rename when necessary', () => {
      assertReduce('(λx.λy.x λz.x) (y z)', 'λy1.y z λz1.y z')
    })

    it('does not count alpha-renames as reduction steps', () => {
      const term = '(λx.λy.x λz.x) (y z)'
      const { reductionSteps, totalSteps } = reduceTerm(term)

      assert.equal(reductionSteps, 1)
      assert.equal(totalSteps, 3)

      assert(reduceTerm(term, { maxReductionSteps: 1 }).terminates)
      assert(!reduceTerm(term, { maxReductionSteps: 0 }).terminates)
    })
  })

  describe('definitions', () => {
    it('does not reduce standalone definitions', () => {
      const reductions = reduceProgram(`
        id = λx.x
        true = λt.λf.t
      `)
      assert.equal(reductions.length, 0)
    })

    it('only resolves definitions when used on a top-level expressions', () => {
      const reductions = reduceProgram(`
        id = λx.x
        true = λt.λf.t
        id true
      `)
      assert.equal(reductions.length, 1)
      assert.equal(reductions[0].final, 'λt.λf.t')
    })

    it('records definition resolution steps', () => {
      const code = `
        id = λx.x
        true = λt.λf.t
        id true
      `
      assertReduceSteps(code, [
        'id true -> (λx.x) true',
        '(λx.x) true -> true',
        'true -> λt.λf.t'
      ])
    })

    it('does not count definition resolutions as reduction steps', () => {
      const code = `
        id = λx.x
        id foo
      `
      const { totalSteps, reductionSteps } = reduceTerm(code)
      assert.equal(totalSteps, 2)
      assert.equal(reductionSteps, 1)

      assert(reduceTerm(code, { maxReductionSteps: 1 }).terminates)
      assert(!reduceTerm(code, { maxReductionSteps: 0 }).terminates)
    })

    it('only takes one step to resolve a definition that points to another definition (i.e. a "synonym")', () => {
      const code = `
        id = λx.x
        identity = id
        identity foo
      `
      assertReduceSteps(code, [
        'identity foo -> (λx.x) foo',
        '(λx.x) foo -> foo'
      ])
    })
  })
})

import assert from 'node:assert/strict'
import { Options, Reduction, reduceProgram } from '../src/lambda'

const reduceTerm = (code: string, options?: Options) => {
  const reductions = reduceProgram(code, options)
  assert.equal(reductions.length, 1)
  return reductions[0]
}

const assertReduce = (code: string, expected: string, options?: Options) => {
  assert.equal(reduceTerm(code, options).final, expected)
}

const assertSteps = (
  totalSteps: number,
  renderStep: Reduction['renderStep'],
  expectedSteps: string[]
) => {
  const actualSteps = Array.from({ length: totalSteps }).map((_, i) => {
    const { type, before, after } = renderStep(i)
    return `${type}: ${before} -> ${after}`
  })
  assert.deepEqual(actualSteps, expectedSteps)
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

    it('records alpha renaming steps', () => {
      const { totalSteps, renderStep } = reduceTerm(`(λx.λy.x λz.x) (y z)`)
      assertSteps(totalSteps, renderStep, [
        'alpha: (λx.λy.x λz.x) (y z) -> (λx.λy1.x λz.x) (y z)',
        'alpha: (λx.λy1.x λz.x) (y z) -> (λx.λy1.x λz1.x) (y z)',
        'beta: (λx.λy1.x λz1.x) (y z) -> λy1.y z λz1.y z'
      ])
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

  describe('eta reductions', () => {
    const assertReduceEta = (code: string, expected: string) => {
      assertReduce(code, code)
      assertReduce(code, expected, { etaEnabled: true })
    }

    it('does eta reductions when etaEnabled is passed', () => {
      assertReduceEta('λx.f x', 'f')
    })

    it('does eta reductions inside nested structures', () => {
      assertReduceEta('λs.λz.s z', 'λs.s')
      assertReduceEta('f λx.g x', 'f g')
      assertReduceEta('f (λx.g x) h', 'f g h')
    })

    it('can do multiple nested eta reductions', () => {
      assertReduceEta('λx.λy.f x y', 'f')
      assertReduceEta('λx.λy.λz.f x y z', 'f')
      assertReduceEta('λx.λy.λz.f g h x y z', 'f g h')
      assertReduceEta('λx.λy.f x λz.y z', 'f')
      assertReduceEta('λx.λy.f (λz.x z) y', 'f')
      assertReduceEta('λx.f (λy.g y) λz.x z', 'f g')
    })

    it('counts eta reductions as reduction steps', () => {
      const { totalSteps, reductionSteps } = reduceTerm('λx.f x', {
        etaEnabled: true
      })
      assert.equal(reductionSteps, 1)
      assert.equal(totalSteps, 1)
    })

    it('records eta reduction steps', () => {
      const { totalSteps, renderStep } = reduceTerm('λx.λy.f (λz.x z) λz.y z', {
        etaEnabled: true
      })
      assertSteps(totalSteps, renderStep, [
        'eta: λx.λy.f (λz.x z) λz.y z -> λx.λy.f x λz.y z',
        'eta: λx.λy.f x λz.y z -> λx.λy.f x y',
        'eta: λx.λy.f x y -> λx.f x',
        'eta: λx.f x -> f'
      ])
    })

    it('applies etas after betas', () => {
      const { totalSteps, renderStep } = reduceTerm('λx.(λy.f y) x', {
        etaEnabled: true
      })
      // Notice that the initially there are also two eta reductions available:
      // - the lhs of the inner application: (λy.f y) -> f
      // - or the whole outer function: λx.(λy.f y) x -> λy.f y
      // Both have the same effect as the initial beta reduction.
      assertSteps(totalSteps, renderStep, [
        'beta: λx.(λy.f y) x -> λx.f x',
        'eta: λx.f x -> f'
      ])
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
      const { totalSteps, renderStep } = reduceTerm(`
        id = λx.x
        true = λt.λf.t
        id true
      `)
      assertSteps(totalSteps, renderStep, [
        'def: id true -> (λx.x) true',
        'beta: (λx.x) true -> true',
        'def: true -> λt.λf.t'
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
      const { totalSteps, renderStep } = reduceTerm(`
        id = λx.x
        identity = id
        identity foo
      `)
      assertSteps(totalSteps, renderStep, [
        'def: identity foo -> (λx.x) foo',
        'beta: (λx.x) foo -> foo'
      ])
    })

    it('returns the names of definition that are alpha-equal to the final result', () => {
      const { finalSynonyms } = reduceTerm(`
        true = λt.λf.t
        false = λt.λf.f
        second = λa.λb.b
        second true false
      `)
      assert.deepEqual(finalSynonyms, ['false', 'second'])
    })
  })
})

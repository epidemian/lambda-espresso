let assert = require('assert')
let {Var, App, Fun, Def, parse} = require('../src/lambda')

let assertParse = (str, expectedTerms = [], expectedDefs = {}) => {
  let {terms, defs} = parse(str)
  if (!Array.isArray(expectedTerms)) {
    expectedTerms = [expectedTerms]
  }
  assert.deepEqual(terms, expectedTerms)
  assert.deepEqual(defs, expectedDefs)
}

let assertParseFails = (str, error) => {
  assert.throws(() => parse(str), error)
}

describe('parse()', () => {
  it('parses an empty program', () => {
    assertParse('')
  })

  it('parses variables', () => {
    assertParse('x', Var('x'))
  })

  it('parses almost anything as a variable', () => {
    assertParse('Y', Var('Y'))
    assertParse('42', Var('42'))
    assertParse("optimus'", Var("optimus'"))
    assertParse('WAT!?', Var('WAT!?'))
    assertParse('ñ²', Var('ñ²'))
    assertParse('~>', Var('~>'))
    assertParse('💩', Var('💩'))
  })

  it('parses applications', () => {
    assertParse('a b', App(Var('a'), Var('b')))
  })

  it('parses lambda abstractions', () => {
    assertParse('λx.x', Fun('x', Var('x')))
  })

  it('ignores whitespace', () => {
    assertParse('  x  ', Var('x'))
    assertParse('  x  y  ', App(Var('x'), Var('y')))
    assertParse('  λx  .  x  ', Fun('x', Var('x')))
  })

  it('ignores leading trailing whitespace in multi-line programs', () => {
    assertParse('  x  \n  x y  ', [
      Var('x'),
      App(Var('x'), Var('y'))
    ])
  })

  it('ignores comments', () => {
    let code = `
      ; This is a comment
      x ; The variable x
    `
    assertParse(code, Var('x'))
  })

  it('ignores redundant parentheses', () => {
    assertParse('(x)', Var('x'))
    assertParse('(((x)))', Var('x'))

    assertParse('(x y)', App(Var('x'), Var('y')))
    assertParse('(x) y', App(Var('x'), Var('y')))
    assertParse('x (y)', App(Var('x'), Var('y')))

    assertParse('(λx.x)', Fun('x', Var('x')))
    assertParse('λx.(x)', Fun('x', Var('x')))
  })

  it('ignores newlines inside parentheses', () => {
    let expectedTerm = App(Var('x'), Var('y'))
    assertParse('(x\ny)', expectedTerm)
    assertParse('(\nx\ny)', expectedTerm)
    assertParse('(x\ny\n)', expectedTerm)
    assertParse('x(\ny)', expectedTerm)
    assertParse('(x\n)y', expectedTerm)
  })

  it('parses nested applications', () => {
    assertParse('x y z', App(App(Var('x'), Var('y')), Var('z')))
    assertParse('((x) y) z', App(App(Var('x'), Var('y')), Var('z')))
    assertParse('x (y (z))', App(Var('x'), App(Var('y'), Var('z'))))
  })

  it('parses nested abstractions', () => {
    assertParse('λx.λy.λz.w', Fun('x', Fun('y', Fun('z', Var('w')))))
    assertParse('λx.(λy.(λz.w))', Fun('x', Fun('y', Fun('z', Var('w')))))
  })

  it('parses definitions', () => {
    let code = `
      id = λx.x
      id y
    `
    let expectedTerm = App(Def('id', Fun('x', Var('x'))), Var('y'))
    let expectedDefs = {id: Fun('x', Var('x'))}

    assertParse(code, expectedTerm, expectedDefs)
  })

  it('allows using a definition before it is declared', () => {
    let code = `
      id y
      id = λx.x
    `
    let expectedTerm = App(Def('id', Fun('x', Var('x'))), Var('y'))
    let expectedDefs = {id: Fun('x', Var('x'))}

    assertParse(code, expectedTerm, expectedDefs)
  })

  it('allows a definition referencing other definition(s)', () => {
    let code = `
      id = λx.x
      id2 = id id
    `
    let expectedDefs = {
      id: Fun('x', Var('x')),
      id2: App(
        Def('id', Fun('x', Var('x'))),
        Def('id', Fun('x', Var('x')))
      )
    }

    assertParse(code, [], expectedDefs)
  })

  it('disallows redefinitions', () => {
    let code = `
      foo = λx.x
      bar = λy.y
      foo = λz.z
    `
    assertParseFails(code, /^Error: foo already defined$/)
  })

  it('disallows recursive definitions', () => {
    assertParseFails(
      'walk = (λx.x) walk',
      /^Error: Illegal recursive reference in "walk"\./
    )
  })

  it('disallows mutually-recursive definitions', () => {
    let code = `
      foo = (λx.x) bar
      bar = baz qux
      baz = qux foo
      qux = λx.x
    `
    assertParseFails(
      code,
      /^Error: Illegal recursive reference in "baz"\..*baz → foo → bar → baz/
    )
  })

  it('disallows free variables on definitions', () => {
    assertParseFails(
      'foo = λx.x bar',
      /^Error: Illegal free variable "bar" in "foo"\./
    )
  })

  it('does not confuse definitions with bound variables', () => {
    let code = `
      x = λx.x
      λy.x λx.x y
    `
    let expectedTerm = Fun('y',
      App(
        Def('x', Fun('x', Var('x'))),
        Fun('x', App(Var('x'), Var('y'))))
    )
    let expectedDefs = {x: Fun('x', Var('x'))}

    assertParse(code, expectedTerm, expectedDefs)
  })

  it('fails on empty parentheses', () => {
    assertParseFails('()')
    assertParseFails('a ()')
    assertParseFails('( \n )')
  })

  it('fails when parentheses are unbalanced', () => {
    assertParseFails('(')
    assertParseFails(')')
    assertParseFails('((a)')
    assertParseFails('(a))')
  })

  it('parses a whole program', () => {
    let code = `
      id = λx.x
      k = λx.λy.x
      ω = λx.x x
      Ω = ω ω

      ; This expression has no normal form.
      Ω
      ; But this one does!
      k id Ω ; (not with all reduction strategies though)
    `

    let id = Fun('x', Var('x'))
    let k = Fun('x', Fun('y', Var('x')))
    let ω = Fun('x', App(Var('x'), Var('x')))
    let Ω = App(Def('ω', ω), Def('ω', ω))

    let expectedTerms = [
      Def('Ω', Ω),
      App(App(Def('k', k), Def('id', id)), Def('Ω', Ω))
    ]
    let expectedDefs = {id, k, ω, Ω}

    assertParse(code, expectedTerms, expectedDefs)
  })
})

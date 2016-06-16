assert = require 'assert'
{Var, App, Fun, parse, termStr, reduceProgram} = require '../src/lambda'

parseTerm = (str) ->
  {terms, defs} = parse str
  assert.equal 1, terms.length
  assert.deepEqual {}, defs
  terms[0]

assertParse = (str, expected) ->
  term = parseTerm str
  assert.deepEqual term, expected

describe 'parse()', ->
  
  it 'parses single variables', ->
    assertParse 'x', Var 'x'
    assertParse 'foo42_bar-baz', Var 'foo42_bar-baz'

  it 'parses applications', ->
    assertParse 'a b', App (Var 'a'), (Var 'b')

  it 'parses lambda abstractions', ->
    assertParse 'λx.x', (Fun 'x', (Var 'x'))

  it 'does not parse invalid variables', ->
    # TODO make variables names more flexible so these are all possible!
    assert.throws -> parseTerm 'X'
    assert.throws -> parseTerm '42c'
    assert.throws -> parseTerm 'español'
    assert.throws -> parseTerm '💩'

  it 'does not care about unnecessary parentheses', ->
    assertParse '(x)', Var 'x'
    assertParse '(((x)))', Var 'x'

    assertParse '(x y)', (App (Var 'x'), (Var 'y'))
    assertParse '(x) y', (App (Var 'x'), (Var 'y'))
    assertParse 'x (y)', (App (Var 'x'), (Var 'y'))

    assertParse '(λx.x)', (Fun 'x', (Var 'x'))
    assertParse 'λx.(x)', (Fun 'x', (Var 'x'))

  it 'parses nested applications', ->
    assertParse 'x y z',     (App (App (Var 'x'), (Var 'y')), Var 'z')
    assertParse '((x) y) z', (App (App (Var 'x'), (Var 'y')), Var 'z')
    assertParse 'x (y (z))', (App (Var 'x'), (App (Var 'y'), (Var 'z')))

  it 'parses nested abstractions', ->
    assertParse 'λx.λy.λz.w',     (Fun 'x', (Fun 'y', (Fun 'z', Var 'w')))
    assertParse 'λx.(λy.(λz.w))', (Fun 'x', (Fun 'y', (Fun 'z', Var 'w')))

  it 'does not care about unnecessary whitespace', ->
    assertParse '  x  ', Var 'x'
    assertParse '  x  y  ', (App (Var 'x'), (Var 'y'))
    assertParse '  λx  .  x  ', (Fun 'x', (Var 'x'))

assertTermStr = (str, expected) ->
  term = parseTerm str
  assert.equal (termStr term), expected

describe 'termStr()', ->
  it 'respects operations\' precedence when applying parentheses', ->
    assertTermStr 'λa.a λb.b λc.c λd.d', 'λa.a λb.b λc.c λd.d'
    assertTermStr '(λa.a) (λb.b) (λc.c) λd.d', '(λa.a) (λb.b) (λc.c) λd.d'
    assertTermStr '(((λa.a) λb.b) λc.c) λd.d', '(λa.a) (λb.b) (λc.c) λd.d'
    assertTermStr 'λa.a (λb.b (λc.c (λd.d)))', 'λa.a λb.b λc.c λd.d'

reduceTerm = (str, options) ->
  reductions = reduceProgram str, options
  assert.equal 1, reductions.length
  reductions[0]

assertReduce = (expr, expected) ->
  assert.strictEqual (reduceTerm expr).final, expected

describe 'reduceProgram()', ->

  it 'does not reduce simple irreducible expressions', ->
    assertReduce 'x', 'x'
    assertReduce 'x y', 'x y'
    assertReduce 'λx.x', 'λx.x'

  it 'reduces simple beta-redexes', ->
    assertReduce '(λx.x) y', 'y'
    assertReduce '(λx.x y) z', 'z y'
    assertReduce '(λx.x y) y', 'y y'
    assertReduce '(λx.x x) y', 'y y'

  it 'reduces multiple beta-redex', ->
    assertReduce '(λx.λy.x y) v w', 'v w'

  it 'reduces a beta-redex that is formed only after a reduction', ->
    assertReduce '(λx.x y) (λz.z z)', 'y y'

  it 'does at most maxStep reduction steps', ->
    {totalSteps} = reduceTerm '(λx.x x) (λx.x x)', maxSteps: 42
    assert totalSteps is 42

  it 'indicates when a reduction terminates', ->
    {terminates} = reduceTerm '(λx.x) y'
    assert terminates

  it 'indicates when a reduction does not terminate', ->
    {terminates} = reduceTerm '(λx.x x) (λx.x x)'
    assert not terminates

  describe 'renaming in substitution (λy.T)[x := S]', ->

    it 'renames when y is free in S and x is free in T', ->
      assertReduce '(λx.λy.x y) (y z)', 'λy1.y z y1'

    it 'does not rename if y does not occur free in S but x is free in T', ->
      assertReduce '(λx.λy.x y) (w z)', 'λy.w z y'

    it 'does not rename if y is free in S but x does not occur in T', ->
      assertReduce '(λx.λy.y) (y z)', 'λy.y'

    it 'does not rename if y is free in S but x has only bound occurrences in T', ->
      assertReduce '(λx.λy.y λx.x) (y z)', 'λy.y λx.x'
      assertReduce '(λx.λy.y λx.x x y λx.x) (y z)', 'λy.y λx.x x y λx.x'

    it 'does not choose a name that makes an inner variable bind to another abstraction', ->
      # In this case, λy.λy1.x y y1 must be renamed, but it cannot choose to use
      # [y := y1] because it would make the inner y bind to the second
      # abstraction instead of the first one.
      assertReduce '(λx.λy.λy1.x y) y', 'λy2.λy1.y y2'
      # Same thing as above but with higher numbers.
      assertReduce '(λx.λy4.λy5.x y4) y4', 'λy6.λy5.y4 y6'
      # Same idea, but in this case it has to go quite deep to find a new name.
      assertReduce '(λx.λy.λy1.λy2.λy3.λy4.x y) y', 'λy5.λy1.λy2.λy3.λy4.y y5'

    it 'does not choose a name that collides with free variables', ->
      assertReduce '(λx.λy.x y y1) y', 'λy2.y y2 y1'

    it 'does not choose a name that collides in any form', ->
      # This test combines the other three criteria. y can't be renamed to y1 or
      # y4 because it would collide with free variables; nor renamed to y2 or y5
      # because it would make y bind to an inner abstraction; not renamed to y3
      # or y6 because they are free in the substitution term.
      assertReduce '(λx.λy.λy2.λy5.x y y1 y4) (y y3 y6)', 'λy7.λy2.λy5.y y3 y6 y7 y1 y4'

# TODO Add a test of a beta-reduction that requires more than one
# alpha-conversion, like (λx.(λy.x)(λz.x)) (y z)
# or (λx.λy.x (λz.x)) (y z)
# TODO Add multi-step reduction tests!

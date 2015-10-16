assert = require 'assert'
{parseTerm, reduceTerm, termTreeStr} = require '../lib/lambda'

shouldParse = (expr, expected) ->
  assert.strictEqual (parseTerm expr), expected

shouldReduce = (expr, expected) ->
  assert.strictEqual (reduceTerm expr).final, expected

describe 'parseTerm()', ->

  it 'should remove unnecessary parentheses', ->
    shouldParse '(x)', 'x'
    shouldParse '(((x)))', 'x'

    shouldParse '(x y)', 'x y'
    shouldParse '(x) y', 'x y'
    shouldParse 'x (y)', 'x y'

    shouldParse '(λx.x)', 'λx.x'
    shouldParse 'λx.(x)', 'λx.x'

  it 'should respect application precedence', ->
    shouldParse '((x) y) z', 'x y z'
    shouldParse 'x (y (z))', 'x (y z)'

  it 'should respect abstraction precedence', ->
    shouldParse 'λx.(λy.(λz.w))', 'λx.λy.λz.w'

  it 'should remove unnecessary whitespace', ->
    shouldParse '  x  ', 'x'
    shouldParse '  x  y  ', 'x y'
    shouldParse '  λx  .  x  ', 'λx.x'
    shouldParse '  λx  .  x  (  y  z  )  x  ', 'λx.x (y z) x'

  it 'should respect operations\' precedence when applying parentheses', ->
    shouldParse 'λa.a λb.b λc.c λd.d', 'λa.a λb.b λc.c λd.d'
    shouldParse '(λa.a) (λb.b) (λc.c) λd.d', '(λa.a) (λb.b) (λc.c) λd.d'
    shouldParse '(((λa.a) λb.b) λc.c) λd.d', '(λa.a) (λb.b) (λc.c) λd.d'
    shouldParse 'λa.a (λb.b (λc.c (λd.d)))', 'λa.a λb.b λc.c λd.d'

describe 'reduceTerm()', ->

  it 'should not reduce simple irreducible expressions', ->
    shouldReduce 'x', 'x'
    shouldReduce 'x y', 'x y'
    shouldReduce 'λx.x', 'λx.x'

  it 'should reduce simple beta-redexes', ->
    shouldReduce '(λx.x) y', 'y'
    shouldReduce '(λx.x y) z', 'z y'
    shouldReduce '(λx.x y) y', 'y y'
    shouldReduce '(λx.x x) y', 'y y'

  it 'should reduce multiple beta-redex', ->
    shouldReduce '(λx.λy.x y) v w', 'v w'

  it 'should reduce a beta-redex that is formed only after a reduction', ->
    shouldReduce '(λx.x y) (λz.z z)', 'y y'

  it 'should do at most maxStep reduction steps', ->
    {totalSteps} = reduceTerm '(λx.x x) (λx.x x)', maxSteps: 42
    assert totalSteps is 42

  it 'indicates when a reduction terminates', ->
    {terminates} = reduceTerm '(λx.x) y'
    assert terminates

  it 'indicates when a reduction does not terminate', ->
    {terminates} = reduceTerm '(λx.x x) (λx.x x)'
    assert not terminates

  describe 'renaming in substitution (λy.T)[x := S]', ->

    it 'should rename when y is free in S and x is free in T', ->
      shouldReduce '(λx.λy.x y) (y z)', 'λy1.y z y1'

    it 'should not rename if y does not occur free in S but x is free in T', ->
      shouldReduce '(λx.λy.x y) (w z)', 'λy.w z y'

    it 'should not rename if y is free in S but x does not occur in T', ->
      shouldReduce '(λx.λy.y) (y z)', 'λy.y'

    it 'should not rename if y is free in S but x has only bound occurrences in T', ->
      shouldReduce '(λx.λy.y λx.x) (y z)', 'λy.y λx.x'
      shouldReduce '(λx.λy.y λx.x x y λx.x) (y z)', 'λy.y λx.x x y λx.x'

    it 'should not choose a name that makes an inner variable bind to another abstraction', ->
      # In this case, λy.λy1.x y y1 must be renamed, but it cannot choose to use
      # [y := y1] because it would make the inner y bind to the second
      # abstraction instead of the first one.
      shouldReduce '(λx.λy.λy1.x y) y', 'λy2.λy1.y y2'
      # Same thing as above but with higher numbers.
      shouldReduce '(λx.λy4.λy5.x y4) y4', 'λy6.λy5.y4 y6'
      # Same idea, but in this case it has to go quite deep to find a new name.
      shouldReduce '(λx.λy.λy1.λy2.λy3.λy4.x y) y', 'λy5.λy1.λy2.λy3.λy4.y y5'

    it 'should not choose a name that collides with free variables', ->
      shouldReduce '(λx.λy.x y y1) y', 'λy2.y y2 y1'

    it 'should not choose a name that collides in any form', ->
      # This test combines the other three criteria. y can't be renamed to y1 or
      # y4 because it would collide with free variables; nor renamed to y2 or y5
      # because it would make y bind to an inner abstraction; not renamed to y3
      # or y6 because they are free in the substitution term.
      shouldReduce '(λx.λy.λy2.λy5.x y y1 y4) (y y3 y6)', 'λy7.λy2.λy5.y y3 y6 y7 y1 y4'

describe 'termTreeStr()', ->
  it 'does its thing', ->
    assert.strictEqual (termTreeStr 'a b c λd.e f'), '''
      @
      ├─@
      │ ├─@
      │ │ ├─a
      │ │ ╰─b
      │ ╰─c
      ╰─λd
        ╰─@
          ├─e
          ╰─f
    '''

# TODO Add a test of a beta-reduction that requires more than one
# alpha-conversion, like (λx.(λy.x)(λz.x)) (y z)
# or (λx.λy.x (λz.x)) (y z)
# TODO Add multi-step reduction tests!

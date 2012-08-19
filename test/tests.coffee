assert = require 'assert'
{parse, reduce} = require '../lib/lambda'

shouldParse = (expr, expected) ->
  assert.equal (parse expr), expected

shouldReduce = (expr, expected) ->
  assert.equal (reduce expr), expected

describe 'parse()', ->

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

describe 'reduce()', ->
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
    # FIXME!
#    shouldReduce '(λx.x y) (λz.z z)', 'y y'

  describe 'renaming in substitution (λy.T)[x := S]', ->

    it 'should rename when y is free in S and x is free in T', ->
      shouldReduce '(λx.λy.x y) (y z)', 'λy1.y z y1'

    it 'should not rename if y does not occur free in S but x is free in T', ->
      shouldReduce '(λx.λy.x y) (w z)', 'λy.w z y'


    it 'should not rename if y is free in S but x does not occur in T', ->
      # FIXME!
#      shouldReduce '(λx.λy.y) (y z)', 'λy.y'

    it 'should not rename if y is free in S but x has only bound occurrences in T', ->
      # FIXME!
#      shouldReduce '(λx.λy.y λx.x) (y z)', 'λy.y λx.x'
#      shouldReduce '(λx.λy.y λx.x x y λx.x) (y z)', 'λy.y λx.x x y λx.x'

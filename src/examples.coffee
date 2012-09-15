exports.all = [
  name: 'Basics'
  code: '''
    ; This example is not intend to be a tutorial nor an introduction to λ Calculus.
    ; You should probably read http://en.wikipedia.org/wiki/Lambda_calculus for that :)
    ; As you can see, these are comments. You can run this example clicking the Run button below or pressing Ctrl+Enter.
    ; So... the three basic types of λ expressions are variables:
    x
    ; Applications:
    x y
    ; And abstractions (also known as functions):
    λx.x
    ; If the left side of an application is an abstraction, then a reduction takes place:
    (λx.x) y
    ; That little abstraction at the left is the identity, a very simple function that just reduces to whatever you apply to it.
    ; We can give it a name like so:
    ID = λx.x
    ; And then just refer it by that name:
    ID a
    ; You can apply any kind of λ expression to an abstraction, like another function:
    ID λb.c
    ; Or an application:
    ID (x y)
    ; Or even the identity function itself:
    ID ID
    ; That means you can apply identity to itself as many times as you want and it'll still be identity:
    ID ID ID ID ID
    ; Notice that applications are left-associative, so the line above is equivalent to:
    ((((ID ID) ID) ID) ID)
    
    ; TODO: explain applicative and normal order...
  '''
,
  name: 'Booleans'
  code: '''
    ; Example showcasing Church booleans.
    TRUE = λt.λf.t
    FALSE = λt.λf.f
    AND = λp.λq.p q p
    OR = λp.λq.p p q
          
    ; Print truth tables for AND and OR.
    AND FALSE FALSE
    AND FALSE TRUE
    AND TRUE FALSE
    AND TRUE TRUE
    OR FALSE FALSE
    OR FALSE TRUE
    OR TRUE FALSE
    OR TRUE TRUE
  '''
]

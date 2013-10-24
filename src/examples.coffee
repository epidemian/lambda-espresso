module.exports = [
  name: 'Basics'
  code: '''
    ; This example is not intend to be a tutorial nor an introduction to λ Calculus.
    ; You should check http://en.wikipedia.org/wiki/Lambda_calculus for that :)
    ; As you can see, these are comments. You can run this example clicking the Run
    ; button below or pressing Ctrl+Enter.
    ; So, the three basic types of λ expressions are variables:
    x
    ; Applications:
    x y
    ; And abstractions (also known as functions):
    λx.x
    ; If the left side of an application is an abstraction, then a reduction takes place:
    (λx.x) y
    ; That little abstraction at the left is the identity, a very simple function that
    ; just reduces to whatever you apply to it. We can give it a name (in ALLCAPS) like so:
    ID = λx.x
    ; And then just refer it by that name:
    ID a
    ; You can apply any kind of λ expression to an abstraction, like another function:
    ID λb.c
    ; Or an application:
    ID (x y)
    ; Or even the identity function itself:
    ID ID
    ; That means you can apply identity to itself as many times as you want and it'll still
    ; be identity:
    ID ID ID ID ID
    ; Notice that applications are left-associative, so the line above is equivalent to:
    ((((ID ID) ID) ID) ID)

    ; TODO: explain applicative and normal order...
  '''
,
  name: 'Booleans'
  code: '''
    ; Church booleans

    ; The booleans and their operations can be encoded as the following λ-terms:
    TRUE = λt.λf.t
    FALSE = λt.λf.f
    NOT = λp.p FALSE TRUE
    AND = λp.λq.p q p
    OR = λp.λq.p p q
    IF = λp.λq.λr.p q r

    ; Print truth tables for NOT, AND and OR:
    NOT TRUE
    NOT FALSE
    AND FALSE FALSE
    AND FALSE TRUE
    AND TRUE FALSE
    AND TRUE TRUE
    OR FALSE FALSE
    OR FALSE TRUE
    OR TRUE FALSE
    OR TRUE TRUE

    ; Terms can be nested as much as we want:
    IF (NOT NOT FALSE) (OR FALSE (IF TRUE TRUE FALSE)) FALSE

    ; There's nothing special about "operators", we can treat them as any other value:
    (IF FALSE OR AND) TRUE FALSE
  '''
,
  name: 'Numbers'
  code: '''
    ; Church numerals

    ; The first few numbers are:
    ZERO = λs.λz.z
    ONE = λs.λz.s z
    TWO = λs.λz.s (s z)
    THREE = λs.λz.s (s (s z))
    ; In general, any natural number n can be encoded as:
    ; N = λs.λz.s (s (s ... (s (s z)) ... ))
    ; with s applied n times.

    ; When we get tired of writing numbers like that, we can define a successor function:
    SUCC = λn.λs.λz.s (n s z)
    SUCC THREE

    ; We can think of Church numerals as functions that apply a given function s to a
    ; given value z a number of times. Zero will apply it 0 times (i.e. it'll give
    ; us z back untouched) and three will call it 3 times.
    ; So, we can represent the addition of numbers m and n as first applying n times s to z,
    ; and then applying m times s to that:
    ADD = λm.λn.λs.λz.m s (n s z)
    ADD TWO THREE
    ; ...or, more succinctly, as applying n times the successor function on m (or vice versa):
    ADD' = λm.λn.n SUCC m
    ADD' TWO THREE
    ; Conversely, we could define the successor function as adding one:
    SUCC' = ADD ONE
    SUCC' THREE

    ; Multiplication of m by n is applying m times a function that applies s n times:
    MULT = λm.λn.λs.m (n s)
    MULT THREE THREE
    ; ...or applying m times the addition of n to zero:
    MULT' = λm.λn.m (ADD n) ZERO
    MULT' THREE THREE

    ; Exponentiation n^m has a simple encoding: applying the base m to the exponent n,
    ; which can be understood as applying m successively n times:
    EXP = λm.λn.n m
    EXP TWO THREE
    ; ...or, alternatively, applying m times the multiplication by n to one:
    EXP' = λm.λn.m (MULT n) ONE
    EXP' TWO THREE

    ; The encoding for the predecessor function is quite complex.
    ; The Wikipedia article on Church encoding has a good explanation for this term ;-)
    PRED = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)
    PRED THREE

    ; But given the predecessor function is then easy to define the subtraction:
    SUB = λm.λn.n PRED m
    SUB THREE TWO

    ; To build some predicate functions, we'll use some known boolean terms:
    TRUE = λt.λf.t
    FALSE = λt.λf.f
    AND = λp.λq.p q p

    ; To know if a number n is zero we can pass true as the base value and a function
    ; that always returns false:
    ISZERO = λn.n (λx.FALSE) TRUE
    ISZERO ZERO
    ISZERO TWO

    ; Given the "= 0" predicate, numeric equality between m and n can be defined as
    ; m - n = 0 and n - m = 0
    EQ = λm.λn.AND (ISZERO (SUB m n)) (ISZERO (SUB n m))

    ; Throw everyting into the mix:
    EQ (EXP TWO THREE) (PRED (EXP THREE TWO))
  '''
  # TODO bump up the max-steps for this example (and try to use applicative order).
,
  name: 'Factorial'
  code: '''
    ; Recursion

    ; Borrow some terms from previous examples:
    TRUE = λt.λf.t
    FALSE = λt.λf.f
    IF = λp.λq.λr.p q r

    ZERO = λs.λz.z
    ONE = λs.λz.s z
    TWO = λs.λz.s (s z)
    THREE = λs.λz.s (s (s z))
    FOUR = λs.λz.s (s (s (s z)))

    PRED = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)
    MULT = λm.λn.λs.m (n s)
    ISZERO = λn.n (λx.FALSE) TRUE

    ; We'd like to be able to define a factorial function as:
    ; FACT = λn.IF (ISZERO n) ONE (MULT n (FACT (PRED n)))
    ; But we can't use a term in its own definition.
    ; To achieve recursion, we can instead define a function that will receive itself
    ; as a parameter r, and then recur by calling r with itself and n - 1:
    FACT_REC = λr.λn.IF (ISZERO n) ONE (MULT n (r r (PRED n)))
    ; The real factorial function would then be:
    FACT = FACT_REC FACT_REC
    FACT FOUR

    ; Another way to recur is to use a general purpose fixed-point combinator.
    ; The almighty Y Combinator:
    Y = λf.(λx.f (x x)) (λx.f (x x))

    ; And then there's no need to define a separate function:
    FACT' = Y λr.λn.IF (ISZERO n) ONE (MULT n (r (PRED n)))
    FACT' FOUR
  '''
]

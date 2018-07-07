import { dedent } from './utils'

const examples = [
  {
    name: 'Basics',
    code: dedent(`
    ; This example is not intend to be a tutorial nor an introduction to λ Calculus.
    ; You should check http://en.wikipedia.org/wiki/Lambda_calculus for that :)
    ; As you can see, these are comments. You can run this example clicking the Run
    ; button below or pressing Ctrl+Enter.
    ; So, the three basic types of λ expressions are:
    ; Variables:
    x
    ; Applications:
    x y
    ; And lambda abstractions (also known as functions):
    λx.x
    ; If the left-side of an application is an abstraction, then a reduction takes place:
    (λx.x) y
    ; That little abstraction at the left is the identity, a very simple function that
    ; just reduces to whatever you apply to it. We can give it a name like so:
    id = λx.x
    ; And then just refer it by that name:
    id a
    ; You can apply any kind of λ expression to an abstraction, like another function:
    id λb.c
    ; Or an application:
    id (x y)
    ; Or even the identity function itself:
    id id
    ; That means you can apply identity to itself as many times as you want and it'll still
    ; be identity:
    id id id id id
    ; Notice that applications are left-associative, so the line above is equivalent to:
    ((((id id) id) id) id)

    ; TODO: explain applicative and normal order...
  `)
  },
  {
    name: 'Booleans',
    code: dedent(`
    ; Church booleans

    ; The booleans and their operations can be encoded as the following λ-terms:
    true = λt.λf.t
    false = λt.λf.f
    not = λp.p false true
    and = λp.λq.p q p
    or = λp.λq.p p q
    if = λp.p

    ; Print truth tables for not, and and or:
    not true
    not false
    and false false
    and false true
    and true false
    and true true
    or false false
    or false true
    or true false
    or true true

    ; Terms can be nested as much as we want:
    if (not (not true)) (or false (if true true false)) false

    ; There's nothing special about "operators", we can treat them as any other value:
    (if false or and) true false
  `)
  },
  {
    name: 'Numbers',
    code: dedent(`
    ; Church numerals

    ; The first few numbers are:
    zero = λs.λz.z
    one = λs.λz.s z
    two = λs.λz.s (s z)
    three = λs.λz.s (s (s z))
    ; In general, any natural number n can be encoded as:
    ; N = λs.λz.s (s (s ... (s (s z)) ... ))
    ; with s applied n times.

    ; When we get tired of writing numbers like that, we can define a successor function:
    succ = λn.λs.λz.s (n s z)
    succ three

    ; We can think of Church numerals as functions that apply a given function s to a
    ; given value z a number of times. Zero will apply it 0 times (i.e. it'll give
    ; us z back untouched) and three will call it 3 times.
    ; So, we can represent the addition of numbers m and n as first applying n times s to z,
    ; and then applying m times s to that:
    add = λm.λn.λs.λz.m s (n s z)
    add two three
    ; ...or, more succinctly, as applying n times the successor function on m (or vice versa):
    add' = λm.λn.n succ m
    add' two three
    ; Conversely, we could define the successor function as adding one:
    succ' = add one
    succ' three

    ; Multiplication of m by n is applying m times a function that applies s n times:
    mult = λm.λn.λs.m (n s)
    mult three three
    ; ...or applying m times the addition of n to zero:
    mult' = λm.λn.m (add n) zero
    mult' three three

    ; Exponentiation n^m has a simple encoding: applying the base m to the exponent n,
    ; which can be understood as applying m successively n times:
    exp = λm.λn.n m
    exp two three
    ; ...or, alternatively, applying m times the multiplication by n to one:
    exp' = λm.λn.m (mult n) one
    exp' two three

    ; The encoding for the predecessor function is quite complex.
    ; The Wikipedia article on Church encoding has a good explanation for this term ;-)
    pred = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)
    pred three

    ; But given the predecessor function is then easy to define the subtraction:
    sub = λm.λn.n pred m
    sub three two

    ; To build some predicate functions, we'll use some known boolean terms (see 
    ; Booleans example for more info):
    true = λt.λf.t
    false = λt.λf.f
    and = λp.λq.p q p

    ; To know if a number n is zero we can pass true as the base value and a function
    ; that always returns false (note that the "?" is no special syntax; it's just 
    ; part of the name of the predicate):
    zero? = λn.n (λx.false) true
    zero? zero
    zero? two

    ; To know if a number is less or equal to another number, we can subtract them and
    ; see if the result is zero:
    leq = λm.λn.zero? (sub m n)

    ; And given that predicate, numeric equality between m and n can be defined as:
    eq = λm.λn.and (leq m n) (leq n m)

    ; Throwing everything into the mix, we can prove that 2³ = 3² - 1:
    eq (exp two three) (pred (exp three two))
  `)
  },
  {
    name: 'Factorial',
    code: dedent(`
    ; Factorial function and recursion

    ; Note: for this example we'll use boolean and numeric terms from previous 
    ; examples (see below). 
    ; Also not that these factorial definitions won't work with applicative order ;)

    ; We'd like to be able to define a factorial function as:
    ; fact = λn.if (zero? n) one (mult n (fact (pred n)))
    ; But we can't use a term in its own definition.
    ; To achieve recursion, we can instead define a function that will receive itself
    ; as a parameter r, and then recur by calling r with itself and n - 1:
    fact-rec = λr.λn.if (zero? n) one (mult n (r r (pred n)))
    ; The real factorial function would then be:
    fact = fact-rec fact-rec
    fact four

    ; Another way to recur is to use a general purpose fixed-point combinator.
    ; The almighty Y Combinator:
    Y = λf.(λx.f (x x)) (λx.f (x x))
    ; And then there's no need to define a separate function:
    fact' = Y λr.λn.if (zero? n) one (mult n (r (pred n)))
    fact' four

    ; Borrow some terms from previous examples:
    true = λt.λf.t
    false = λt.λf.f
    if = λp.p
    zero = λs.λz.z
    one = λs.λz.s z
    two = λs.λz.s (s z)
    three = λs.λz.s (s (s z))
    four = λs.λz.s (s (s (s z)))
    pred = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)
    mult = λm.λn.λs.m (n s)
    zero? = λn.n (λx.false) true
  `)
  },
  {
    name: 'Extras',
    code: dedent(`
    ; Syntactic Trivia and Miscellaneous
  
    ; Identifiers can contain basically any character (except the few ones reserved for 
    ; syntax: "λ", ".", "=", "(" and ")").
    ; This means you can write some pretty code-looking lambda terms!
    0 = λs.λz.z
    1 = λs.λz.s z
    2 = λs.λz.s (s z)
    + = λm.λn.λs.λz.m s (n s z)
    * = λm.λn.λs.m (n s)
    (+ (* 2 1) 0)
    ; Reinventing (a part of) Lisp is always fun...

    ; You can even use emojis as identifiers! But make sure to use this power responsibly.
    (λ🐴.❓) 🍎

    ; Although line breaks usually act as separators between terms/definitions, 
    ; you can use parentheses to split a complex term into multiple lines:
    fib = Y λf.λn.(
      if (≤ n 1)
         n
         (+ (f (- n 1))
            (f (- n 2))))
    fib 0
    fib 1
    fib 2
    fib 7

    ; The rest of the definitions to make the above code work. Not much to see here...
    Y = λf.(λx.f (x x)) (λx.f (x x))
    - = λm.λn.n pred m
    ≤ = λm.λn.zero? (- m n)
    pred = λn.λs.λz.n (λf.λg.g (f s)) (λx.z) (λx.x)
    zero? = λn.n (λx.false) true
    true = λt.λf.t
    false = λt.λf.f
    if = λp.p
    7 = λs.λz.s (s (s (s (s (s (s z))))))
    13 = λs.λz.s (s (s (s (s (s (s (s (s (s (s (s (s z))))))))))))
    ❓ = λ💩.💩 💩 💩
  `)
  }
]

export default examples

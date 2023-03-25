- Better editor
  - Check MathCAD, Mathematica or Jupyter notebooks for ideas
  - Use an actual text editor instead of a plain textarea
  - Syntax highlighting
  - Show evaluation results interleaved in the text editor, under (or besides)
    the expression that the user typed
  - Allow links and rich text on comments ala Markdown. E.g. show `*bold*` text as bold
- Improve the replacing `\` with `λ` to avoid losing undo stack. Maybe using a rich text editor, or a font that has `\` character replaced entirely.
- Change name of the project to Lambda Notes or something like that; simpler, easier to remember.
- Change definition operator to := to match Wikipedia article and normal notation (and to allow defining = as a identifier).
  - Maybe investigate a bit more first to see if there's consensus about whether to use = or :=
- Implement "call by need" strategy (lazy)
- Save options and code in localStorage.
- Add expected output to examples and run them in tests
- Add more examples:
  - Lists (or ranges)
  - Prime number generator? (IDK if division is implementable though...)
  - FizzBuzz http://experthuman.com/programming-with-nothing (or a subset of it)
- Add non-default option values to generated links.
- Copy link to clipboard when clicking Share
  - Maybe use native navigator.share() if available
- Run lambda evaluation on a web worker to avoid locking the UI when computing heavy things.
- Do not collapse reductions just by clicking; it's annoying if you try to select some text.
- Add a keyboard shortcut for Share (maybe ctrl+S)
- Avoid "too much recursion" errors
  - Maybe use trampolining (or something similar)
  - Maybe convert recursive functions into loops using local arrays as stacks if needed
- Add "about" page/dialog with a brief description of what this is and how it was done.
- Improve hacky implementations:
  - terms highlighting
  - marking reduction steps
  (^ basically, anything that extends the core term objects, and changes their shape/type)
  - substitute and renameForSubstitution/applySubstitution distinction. Ideally there should only be one substitute function.
  - before/after step recording.
    - Maybe steps could be recorded as simple data, like `{ type: 'beta',
      location: Trail}` where Trail is a linked-list-like object with the
      location of the function application inside the entire lambda expression
      that can be constructed cheaply in an append-only fashion on each
      recursion step.
- Check to see if HTML injections are possible due to the use of .innerHTML
- Add references to nice intro material to Lambda Calculus:
  - [http://codon.com/programming-with-nothing](http://codon.com/programming-with-nothing)
  - [Ruby Conf 12 - Y Not- Adventures in Functional Programming by Jim Weirich](https://www.youtube.com/watch?v=FITJMJjASUs)
  - Lambda Calculus page on Wikipedia

- Wacky: Add JS embedding so we can evaluate JS functions. Imagine:

  ```
  three = λs.λz.s (s (s z))
  exp = λm.λn.n m
  to-js-num = λn.n `n => n + 1` `0`
  to-js-num (exp three three)
  > prints 27 in a computer-looking way
  ```
  - JS expressions can be any JS value, including functions of course. \
  - These JS values can be passed around as lambda terms, but they are "opaque", i.e., the reducer functions cannot see inside a JS value.
  - The only other thing that can be done with a JS value besides passing it around, is to call it when it is the LHS of an application.
  - Only values that are functions can be called. So this
    ```
    `n => n + 1` `2`
    ```
    is valid, but this:
    ```
    `2` `"whatever"`
    ```
    should raise an error (preferably something different that the normal `TypeError: 2 is not a function` that `(2)("whatever")` raises)
  - JS values can only be called with other JS values. They cannot receive lambda terms. Of course, the other way around is OK: lambda functions can receive JS values. This allows us to go from the lambda calculus world into JS wordle, mostly for output/inspection purposes, but not vice-versa. It also prevents complications of going back and forth between these two worlds, or having to decide/expose how a JS function can call a lambda function, or return one.


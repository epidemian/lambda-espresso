let {Var, Fun, App, Def} = require('./terms')
let {markStep, composeFun, composeAppL, composeAppR} = require('./helpers')
let freeIn = require('./free-in')

// Applies the substitution T[x := S]
// I.e., substitutes the variable x for the term S in the term T.
let substitute = (t, x, s) => {
  switch (t.type) {
  case Var:
    // x[x := S] = S
    // y[x := S] = y
    return t.name === x ? s : t
  case Fun:
    // (λx.E)[x := S] = λx.E
    // λx creates a new context for x so no further substitution is needed.
    if (t.param === x) return t
    // (λy.E)[x := S] with x != y
    // If y is free in S and x is free in E, then must α-convert λy.E to avoid
    // name conflicts.
    if (freeIn(t.param, s) && freeIn(x, t.body)) {
      // (λy.E)[x := S] = λy'.(E[y := y'][x := S])
      let newVarName = renameVar(t.param, t.body, s)
      let renamedBody = applySubstitution(t.body, t.param, Var(newVarName))
      return Fun(newVarName, substitute(renamedBody, x, s))
    } else {
      // (λy.E)[x := S] = λy.(E[x := S])
      return Fun(t.param, substitute(t.body, x, s))
    }
  case App:
    // (U V)[x := S] = (U[x := S]) (V[x := S])
    return App(substitute(t.left, x, s), substitute(t.right, x, s))
  case Def:
    return t
  }
}

// Note: renameForSubstitution() and applySubstitution() are the same as
// substitute(), only split up into two different steps. We need them that way
// to be able to do all alpha-renaming steps before each beta-reduction, but it
// would be nice to have these three functions DRY up a bit.

// Performs the α-conversions necessary for the substitution T[x := S], but does
// not perform the substitution itself.
// Records the α-conversions by calling cb.
let renameForSubstitution = (t, x, s, cb) => {
  switch (t.type) {
  case Var:
  case Def:
    return t
  case Fun:
    if (t.param === x) return t
    if (freeIn(t.param, s) && freeIn(x, t.body)) {
      let newVarName = renameVar(t.param, t.body, s)
      let renamedBody = applySubstitution(t.body, t.param, Var(newVarName))
      cb(markStep('alpha', t, t = Fun(newVarName, renamedBody)))
    }
    let body = renameForSubstitution(t.body, x, s, composeFun(cb, t.param))
    return Fun(t.param, body)
  case App:
    let l = renameForSubstitution(t.left, x, s, composeAppR(cb, t.right))
    let r = renameForSubstitution(t.right, x, s, composeAppL(cb, l))
    return App(l, r)
  }
}

// Applies the substitution T[x := S] directly, without doing α-conversions.
let applySubstitution = (t, x, s) => {
  switch (t.type) {
  case Var:
    return t.name === x ? s : t
  case Fun:
    return t.param === x
      ? t
      : Fun(t.param, applySubstitution(t.body, x, s))
  case App:
    let l = applySubstitution(t.left, x, s)
    let r = applySubstitution(t.right, x, s)
    return App(l, r)
  case Def:
    return t
  }
}

// Renames a variable to avoid naming conflicts case doing: a substitution.
let renameVar = (oldName, t, s) => {
  // Split the name into base and number part.
  let base = oldName.replace(/\d+$/, '')
  let match = oldName.match(/\d+$/)
  let n = match ? parseInt(match[0]) : 0

  while (true) {
    n++
    let newName = base + n
    let isValid =
      // Avoid name collisions with substitution term.
      !freeIn(newName, s) &&
      // Avoid name collisions with free variables in body.
      !freeIn(newName, t) &&
      // Avoid name collisions with inner functions.
      !varRenameCollides(t, oldName, newName)
    if (isValid)
      return newName
  }
}

// Whether a variable rename collides in a given term. That is, if changing the
// occurrences of oldName with newName in t would make it change t's meaning
// (i.e. not be α-equivalent).
let varRenameCollides = (t, oldName, newName) => {
  switch (t.type) {
  case Var:
  case Def:
    return false
  case Fun:
    // A variable rename collides with this function if the old variable
    // was free in the function and the new name for the variable is the
    // same as the param of the function, thus changing old free variable
    // binding.
    return t.param === newName && freeIn(oldName, t) ||
      // Or if the renaming collides in the body of the function.
      varRenameCollides(t.body, oldName, newName)
  case App:
    return varRenameCollides(t.left, oldName, newName) ||
      varRenameCollides(t.right, oldName, newName)
  }
}

module.exports = {substitute, renameForSubstitution, applySubstitution}

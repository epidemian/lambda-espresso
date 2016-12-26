let {Var, Fun, App, Def} = require('./terms')
let {timed, collapseWhitespace} = require('../utils')
let {Parser} = require('./grammar')

// Parses an input program string and returns an object with the top-level terms
// and definitions of the program.
module.exports = timed('parse', str => {
  // A custom Jison parser.
  let parser = new Parser()

  // A definition table with the definition term by their names.
  let defs = {}
  // The terms of the program.
  let terms = []

  // Add some handy functions so the parser can build the AST.
  parser.yy = {
    parseFunction: Fun,
    parseApplication: App,
    parseDefinition: (name, term) => {
      if (defs[name]) throw Error(`${name} already defined`)
      defs[name] = term
    },
    parseTopLevelTerm: (term) => {
      terms.push(term)
    },
    parseIdentifier: Ref
  }

  parser.parse(str)

  terms.forEach(t => resolveTermRefs(t, defs))

  let refNames = {}
  for (let name in defs) {
    resolveDefRefs(name, defs[name], defs, refNames)
  }

  return {defs, terms}
})

// Temporary term used only while parsing as a placeholder for wither a Var o a
// Ref. On the first pass the parser cannot know if an identifier is a variable
// or a definition (because definitions can be declared after their use), so it
// stores a Ref instead and then on a second pass decides what it should be and
// *mutates* the Ref in-place to become either a Var or a Ref.
let Ref = name => ({type: Ref, name})

// Changes all Refs inside term t to either Vars or Defs.
let resolveTermRefs = (t, defs, boundNames = []) => {
  switch (t.type) {
  case Ref:
    let free = boundNames.indexOf(t.name) < 0
    if (t.name in defs && free) {
      t.type = Def
      t.term = defs[t.name]
    } else {
      t.type = Var
    }
    break
  case App:
    resolveTermRefs(t.left, defs, boundNames)
    resolveTermRefs(t.right, defs, boundNames)
    break
  case Fun:
    resolveTermRefs(t.body, defs, boundNames.concat(t.param))
    break
  }
}

// Changes all Refs inside term t to either Vars or Defs.
let resolveDefRefs = (defName, t, defs, refNames, boundNames = []) => {
  switch (t.type) {
  case Ref:
    let bound = boundNames.indexOf(t.name) >= 0
    if (bound) {
      t.type = Var
    } else if (t.name in defs) {
      refNames[defName] = [...refNames[defName] || [], t.name]
      checkForCircularRefs(defName, t.name, refNames)
      t.type = Def
      t.term = defs[t.name]
    } else {
      throw Error(collapseWhitespace(
        `Illegal free variable "${t.name}" in "${defName}". 
        Definitions cannot have free variables.`
      ))
    }
    break
  case App:
    resolveDefRefs(defName, t.left, defs, refNames, boundNames)
    resolveDefRefs(defName, t.right, defs, refNames, boundNames)
    break
  case Fun:
    let boundOnBody = boundNames.concat(t.param)
    resolveDefRefs(defName, t.body, defs, refNames, boundOnBody)
    break
  }
}

let checkForCircularRefs = (name, refName, refNames, path = []) => {
  if (name === refName) {
    let circularNote = path.length
      ? `In this case the definition does not reference itself directly, but 
        through other definitions: ${[name, ...path, name].join(' → ')}.`
      : ''
    throw Error(collapseWhitespace(
      `Illegal recursive reference in "${name}". Definitions cannot
      reference themselves; they are just simple find&replace mechanisms.
      ${circularNote}
      If you want to write a recursive function, look for "Y combinator" ;)`
    ))
  }

  let nextRefs = refNames[refName] || []
  nextRefs.forEach(nextRef =>
    checkForCircularRefs(name, nextRef, refNames, [...path, refName])
  )
}

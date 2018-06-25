import { Term, Fun, App } from './terms'
import { timeIt, collapseWhitespace } from '../utils'
import { Parser } from './grammar'

type Definitions = { [key: string]: Term }

// Parses an input program string and returns an object with the top-level terms
// and definitions of the program.
const parse = (str: string) => timeIt('parse', () => {
  // A custom Jison parser.
  let parser = new Parser()

  // A definition table with the definition term by their names.
  let defs: Definitions = {}
  // The terms of the program.
  let terms: Term[] = []

  // Add some handy functions so the parser can build the AST.
  parser.yy = {
    parseFunction: Fun,
    parseApplication: App,
    parseDefinition: (name: string, term: Term) => {
      if (defs[name]) throw Error(`${name} already defined`)
      defs[name] = term
    },
    parseTopLevelTerm: (term: Term) => {
      terms.push(term)
    },
    parseIdentifier: (name: string) => ({ type: 'ref', name })
  }

  parser.parse(str)

  terms.forEach(t => resolveTermRefs(t, defs))

  let refNames = {}
  for (let name in defs) {
    resolveDefRefs(name, defs[name], defs, refNames)
  }

  return {defs, terms}
})

export default parse

// Temporary term used only while parsing as a placeholder for wither a Var o a
// Ref. On the first pass the parser cannot know if an identifier is a variable
// or a definition (because definitions can be declared after their use), so it
// stores a Ref instead and then on a second pass decides what it should be and
// *mutates* the Ref in-place to become either a Var or a Ref.
// TODO: Remove this hack.
type TermOrRef = Term | { type: 'ref', name: string }

// Changes all Refs inside term t to either Vars or Defs.
let resolveTermRefs = (
  t: TermOrRef, defs: Definitions, boundNames: string[] = []
) => {
  switch (t.type) {
  case 'ref':
    let free = boundNames.indexOf(t.name) < 0
    if (t.name in defs && free) {
      Object.assign(t, { type: 'def', term: defs[t.name] })
    } else {
      Object.assign(t, { type: 'var' })
    }
    break
  case 'app':
    resolveTermRefs(t.left, defs, boundNames)
    resolveTermRefs(t.right, defs, boundNames)
    break
  case 'fun':
    resolveTermRefs(t.body, defs, boundNames.concat(t.param))
    break
  }
}

type RefNames = { [key: string]: string[] }

// Changes all Refs inside term t to either Vars or Defs.
let resolveDefRefs = (
  defName: string, 
  t: TermOrRef, 
  defs: Definitions, 
  refNames: RefNames, 
  boundNames: string[] = []
) => {
  switch (t.type) {
  case 'ref':
    let bound = boundNames.indexOf(t.name) >= 0
    if (bound) {
      Object.assign(t, { type: 'var' })
    } else if (t.name in defs) {
      refNames[defName] = [...refNames[defName] || [], t.name]
      checkForCircularRefs(defName, t.name, refNames)
      Object.assign(t, { type: 'def', term: defs[t.name]})
    } else {
      throw Error(collapseWhitespace(
        `Illegal free variable "${t.name}" in "${defName}". 
        Definitions cannot have free variables.`
      ))
    }
    break
  case 'app':
    resolveDefRefs(defName, t.left, defs, refNames, boundNames)
    resolveDefRefs(defName, t.right, defs, refNames, boundNames)
    break
  case 'fun':
    let boundOnBody = boundNames.concat(t.param)
    resolveDefRefs(defName, t.body, defs, refNames, boundOnBody)
    break
  }
}

let checkForCircularRefs = (
  name: string, refName: string, refNames: RefNames, path: string[] = []
) => {
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

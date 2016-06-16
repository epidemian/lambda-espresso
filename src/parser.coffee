{Var, Fun, App, Def} = require './core'
{timed} = require './helpers'

# Parses an input program string and returns an object with the top-level terms
# and definitions of the program.
exports.parse = timed 'parse', (str) ->
# A custom Jison parser.
  parser = new (require './grammar').Parser

  # A definition table with the definitions by their names.
  defs = {}
  # The terms of the program.
  terms = []

  # Add some handy functions so the parser can build the AST.
  parser.yy =
    parseFunction: Fun
    parseApplication: App
    parseDefinition: (name, term) ->
      throw Error "#{name} already defined" if defs[name]
      defs[name] = Def name, term
    parseTopLevelTerm: (term) -> terms.push term
    parseIdentifier: Ref

  parser.parse str

  for t in terms
    resolveTermRefs t, defs

  refNames = {}
  for name, def of defs
    resolveDefRefs name, def.term, defs, refNames

  {defs, terms}

# Temporary term used only while parsing as a placeholder for wither a Var o a
# Ref. On the first pass the parser cannot know if an identifier is a variable
# or a definition (because definitions can be declared after their use), so it
# stores a Ref instead and then on a second pass decides what it should be and
# *mutates* the Ref in-place to become either a Var or a Ref.
Ref = (name) -> {type: Ref, name}

# Changes all Refs inside term t to either Vars or Defs.
resolveTermRefs = (t, defs, boundNames = []) ->
  switch t.type
    when Ref
      free = t.name not in boundNames
      if t.name of defs and free
        t.type = Def
        t.term = defs[t.name].term
      else
        t.type = Var
    when App
      resolveTermRefs t.left, defs, boundNames
      resolveTermRefs t.right, defs, boundNames
    when Fun
      resolveTermRefs t.body, defs, boundNames.concat(t.param)
  undefined

# Changes all Refs inside term t to either Vars or Defs.
resolveDefRefs = (defName, t, defs, refNames, boundNames = []) ->
  switch t.type
    when Ref
      bound = t.name in boundNames
      if bound
        t.type = Var
      else if t.name of defs
        (refNames[defName] or= []).push t.name
        checkForCircularRefs defName, t.name, refNames
        t.type = Def
        t.term = defs[t.name].term
      else
        throw Error "Illegal free variable \"#{t.name}\" in \"#{defName}\".
          Definitions cannot have free variables"
    when App
      resolveDefRefs defName, t.left, defs, refNames, boundNames
      resolveDefRefs defName, t.right, defs, refNames, boundNames
    when Fun
      resolveDefRefs defName, t.body, defs, refNames, boundNames.concat(t.param)
  undefined

checkForCircularRefs = (name, refName, refNames, path = []) ->
  if name is refName
    circularNote = path.length and "In this case the definition does not
      reference itself directly, but through other definitions:
      #{[name, path..., name].join ' → '}. "
    message = "Illegal recursive reference in \"#{name}\". Definitions cannot
      reference themselves; they are just simple find&replace mechanisms. " +
      (circularNote or '') +
      'If you want to write a recursive function, look for "Y combinator" ;)'
    throw Error message
  for nextRef in refNames[refName] or {}
    checkForCircularRefs name, nextRef, refNames, [path..., refName]

type Term = 
  | { type: 'var', name: string }
  | { type: 'fun', param: string, body: Term }
  | { type: 'app', left: Term, right: Term }
  | { type: 'def', name: string, term: Term }

// Term constructors.
const Var = (name: string) => ({type: 'var', name})
const Fun = (param: string, body: Term) => ({type: 'fun', param, body})
const App = (left: Term, right: Term) => ({type: 'app', left, right})
const Def = (name: string, term: Term) => ({type: 'def', name, term})

export { Term, Var, Fun, App, Def }

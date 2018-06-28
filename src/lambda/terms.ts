type Var = { type: 'var', name: string }
type Fun = { type: 'fun', param: string, body: Term }
type App = { type: 'app', left: Term, right: Term }
type Def = { type: 'def', name: string, term: Term }
type Term = Var | Fun | App | Def

// Term constructors.
const Var = (name: string): Var => ({type: 'var', name})
const Fun = (param: string, body: Term): Fun => ({type: 'fun', param, body})
const App = (left: Term, right: Term): App => ({type: 'app', left, right})
const Def = (name: string, term: Term): Def => ({type: 'def', name, term})

export { Term, Var, Fun, App, Def }

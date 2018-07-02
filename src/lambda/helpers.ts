import { Term, Fun, App, Def } from './terms'

export type Callback = (t: Term) => void

// Compose a callback function with a term constructor.
export const composeFun = (fn: Callback, x: string) => (b: Term) => fn(Fun(x, b))
export const composeAppL = (fn: Callback, l: Term) => (r: Term) => fn(App(l, r))
export const composeAppR = (fn: Callback, r: Term) => (l: Term) => fn(App(l, r))

export type Definitions = { [key: string]: Term }

// Represents a reduction "step" as displayed on the application.
export type Step =
  | { type: 'alpha', before: Fun, after: Fun }
  | { type: 'beta', before: App, after: Term }
  | { type: 'eta' , before: Fun, after: Term }
  | { type: 'def' , before: Def, after: Term }

// Mark a reduction step on the `after` term.
export const markStep = (step: Step) => ({ ...step.after, step })

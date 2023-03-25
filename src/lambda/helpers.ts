import { App, Def, Fun, Term } from './terms'

export type Callback = (t: Term) => void

// Compose a callback function with a term constructor.
export const composeFun = (fn: Callback, x: string) => (b: Term) =>
  fn(Fun(x, b))
export const composeAppL = (fn: Callback, l: Term) => (r: Term) => fn(App(l, r))
export const composeAppR = (fn: Callback, r: Term) => (l: Term) => fn(App(l, r))

export type Definitions = Record<string, Term>

// Represents a reduction "step" as displayed on the application.
export type Step =
  | { type: 'alpha'; before: Fun; after: Fun }
  | { type: 'beta'; before: App; after: Term }
  | { type: 'eta'; before: Fun; after: Term }
  | { type: 'def'; before: Def; after: Term }

export type AnnotatedTerm = Term & { step: Step }

// Mark a reduction step on the `after` term.
export const markStep = (step: Step): AnnotatedTerm => ({ ...step.after, step })

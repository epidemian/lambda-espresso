# λ-Espresso ☕

[![CI Status](https://img.shields.io/github/actions/workflow/status/epidemian/lambda-espresso/ci.yml?branch=main&logo=github)](https://github.com/epidemian/lambda-espresso/actions/workflows/ci.yml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

An interactive λ calculus interpreter.

## Usage

You can play with λ-Espresso [here](https://demian.ferrei.ro/lambda-espresso/).

Ideas and suggestions are welcomed, please [open an issue](https://github.com/epidemian/lambda-espresso/issues) or, better yet, send a pull request :)

## Development

λ-Espresso uses [Jison](http://jison.org/) to generate the λ calculus grammar parser, [Mocha](http://mochajs.org/) for unit-testing and [Browserify](http://browserify.org/) for building the browser script.

Assuming you have Node.js installed, clone the repo and install the dependencies with `npm install`.

Then, use `npm start` to build and start running *everything*: an HTTP server on [localhost:8080](http://localhost:8080), tests, linter and bundle process that re-run when needed.

The icons font was generated using [Fontastic](http://app.fontastic.me)

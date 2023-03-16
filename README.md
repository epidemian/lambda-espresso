# λ-Espresso ☕

[![Build Status](https://img.shields.io/travis/epidemian/lambda-espresso.svg?style=flat-square)](https://travis-ci.org/epidemian/lambda-espresso)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

An interactive λ calculus interpreter.

## Usage

You can play with λ-Espresso [here](https://demian.ferrei.ro/lambda-espresso/).

Ideas and suggestions are welcomed, please [open an issue](https://github.com/epidemian/lambda-espresso/issues) or, better yet, send a pull request :)

## Development

λ-Espresso uses [Jison](http://jison.org/) to generate the λ calculus grammar parser, [Mocha](http://mochajs.org/) for unit-testing and [Browserify](http://browserify.org/) for building the browser script.

Assuming you have Node.js installed, clone the repo and install the dependencies with `npm install`.

Then, use `make` to build everything, or `make watch` to build everything and run the tests every time the source files change.

The icons font was generated using [Fontastic](http://app.fontastic.me)

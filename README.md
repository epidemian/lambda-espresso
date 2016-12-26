# λ-Espresso ☕

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)


An interactive λ calculus interpreter.

## Usage

You can play with λ-Espresso [here](http://epidemian.github.io/lambda-espresso/).

Ideas and suggestions are welcomed, please [open an issue](https://github.com/epidemian/lambda-espresso/issues) or, better yet, send a pull request :)

## Development

λ-Espresso uses [Jison](http://jison.org/) to generate the λ calculus grammar parser, [Mocha](http://visionmedia.github.com/mocha/) for unit-testing and [Browserify](http://browserify.org/) for building the browser script.

Assuming you have Node.js installed, clone the repo and install the dependencies with `npm install`.

Then, use `make` to build everything, or `make watch` to build everything and run the tests every time the source files change (uses inotifywait).

The icons font was generated using [Fontastic](http://app.fontastic.me)

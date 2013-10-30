# :coffee: λ-Espresso :coffee:

A λ calculus interpreter written in CoffeeScript.

## Usage

You can play with λ-Espresso [here](http://epidemian.github.io/lambda-espresso/).

Ideas and suggestions are welcome, please [open an issue](https://github.com/epidemian/lambda-espresso/issues) or, better yet, send a pull request :)

## Development

λ-Espresso is written in CoffeeScript and uses [Jison](http://jison.org/) to generate the λ calculus grammar parser, [Mocha](http://visionmedia.github.com/mocha/) for unit-testing and [Browserify](http://browserify.org/) for building the browser script.

Assuming you have Node.js installed, clone the repo and install the dependencies with `npm install`.

Then, use `make` to build everything, or `make watch` to build everything and run the tests every time the source files change (uses inotifywait).
# :coffee: λ-Espresso :coffee:

A λ calculus interpreter written in CoffeeScript.

## Usage

You can play with λ-Espresso [here](http://epidemian.github.io/lambda-espresso/).

Ideas and suggestions are welcome, please [open an issue](https://github.com/epidemian/lambda-espresso/issues) or, better yet, send a pull request :)

## Development

λ-Espresso is written in CoffeeScript and uses [Jison](http://jison.org/) to generate the λ calculus grammar parser, [Mocha](http://visionmedia.github.com/mocha/) for unit-testing, [Browserify](http://browserify.org/) for building the browser script and [Nodemon](https://github.com/remy/nodemon/) for watching files and recompiling when necessary.

Assuming you have Node.js installed, clone the repo and install the dependencies:

```bash
npm install
```

Then, run `node_modules/.bin/cake watch:test` (or simply `cake watch:test` if you have `node_modules/.bin` in your PATH) to run the tests every time the source files change, or `node_modules/.bin/cake watch:index` to build the index.js file used on the website every time the source files change.

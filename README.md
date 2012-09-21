# ☕ λ-Espresso ☕

A λ calculus interpreter written in CoffeeScript.

## Usage

You can play with λ-Espresso [here](http://epidemian.github.com/lambda-espresso/).

Have any ideas or suggestions? You can [create a ticket](https://github.com/epidemian/lambda-espresso/issues) on GitHub :)

## Development

Install Node.js and NPM.

λ-Espresso uses [CoffeeScript](http://coffeescript.org/) as the main programming language, [Jison](http://jison.org/) to generate the λ calculus grammar parser, [Mocha](http://visionmedia.github.com/mocha/) for unit-testing and [Nodemon](https://github.com/remy/nodemon/) to help with compiling/bundling the application.

To install all those, run `sudo npm install` on the project directory.

Then, run `cake watch:test` to run the tests everytime the source files change, or `cake watch:index` to build the index.js file used on the website everytime the source files change.
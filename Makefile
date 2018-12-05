bin_dir = node_modules/.bin
js_bundle = assets/index.js
browserify_opts = --debug --detect-globals false --no-builtins -p tsify
grammar_file = src/lambda/grammar.js

all: build

$(grammar_file): src/lambda/grammar.jison
	$(bin_dir)/jison -o $(grammar_file) src/lambda/grammar.jison

$(js_bundle): src/*.ts grammar
	$(bin_dir)/browserify $(browserify_opts) src/app.ts > $(js_bundle)

.PHONY: grammar
grammar: $(grammar_file)

.PHONY: build
build: $(js_bundle)

.PHONY: build_prod
build_prod: grammar
	$(bin_dir)/browserify $(browserify_opts) src/app.ts \
	  | $(bin_dir)/terser --source-map "root='.',url='index.js.map',content=inline" -o $(js_bundle)

.PHONY: clean
clean:
	rm -f $(grammar_file) $(js_bundle) $(js_bundle).map

.PHONY: test
test: grammar
	$(bin_dir)/mocha --growl --colors

.PHONY: lint
lint:
	$(bin_dir)/tslint --project .

.PHONY: lint-fix
lint-fix:
	$(bin_dir)/tslint --project . --fix

.PHONY: watch
watch:
	@while true; do \
	  make --no-print-directory test lint; \
	  make --no-print-directory build; \
	  inotifywait \
	    --event modify,close_write,move,move_self,create,delete,delete_self \
	    --quiet --recursive \
	    src test; \
	done

.PHONY: bench
bench: grammar
	$(bin_dir)/ts-node src/benchmark.ts 

.PHONY: publish
publish:
	@git diff-index --quiet HEAD || ( \
	  echo 'Commit everything before publishing!'; exit 1 \
	)
	git checkout gh-pages
	git merge master
	make build_prod
	git add assets
	git commit -m 'Update static assets'
	git push origin gh-pages
	git checkout master

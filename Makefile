bin_dir = node_modules/.bin
js_bundle = assets/index.js
browserify_opts = --debug --detect-globals false --no-builtins
grammar_file = src/lambda/grammar.js

all: build

$(grammar_file): src/lambda/grammar.jison
	$(bin_dir)/jison -o $(grammar_file) src/lambda/grammar.jison

$(js_bundle): src/*.js $(grammar_file)
	$(bin_dir)/browserify $(browserify_opts) src/app.js > $(js_bundle)

.PHONY: build
build: $(js_bundle)

.PHONY: build_prod
# All of this is basically equivalent to
# browserify -t bubleify src/index.js | /uglifyjs > $(js_bundle)
# All the extra stuff is just to have source maps on production.
build_prod: $(grammar_file)
	$(bin_dir)/browserify $(browserify_opts) -t bubleify src/app.js \
	  | $(bin_dir)/exorcist --base . $(js_bundle).map.tmp > $(js_bundle).tmp
	$(bin_dir)/uglifyjs \
	  --in-source-map $(js_bundle).map.tmp \
	  --source-map $(js_bundle).map \
	  --source-map-root . \
	  --source-map-url index.js.map \
	  $(js_bundle).tmp > $(js_bundle)
	rm $(js_bundle).tmp $(js_bundle).map.tmp

.PHONY: clean
clean:
	rm -f $(grammar_file) $(js_bundle) $(js_bundle).map

.PHONY: test
test: $(grammar_file)
	$(bin_dir)/mocha --growl --colors

.PHONY: lint
lint:
	$(bin_dir)/eslint . --ignore-path .gitignore --cache

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
bench:
	$(bin_dir)/node src/benchmark.js

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

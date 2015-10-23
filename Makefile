coffee_files = $(wildcard src/*.coffee)
bin_dir = node_modules/.bin
js_grammar = src/grammar.js
js_bundle = assets/index.js

all: build

$(js_grammar): src/grammar.jison
	$(bin_dir)/jison -o $@ $<

$(js_bundle): $(coffee_files) $(js_grammar)
	$(bin_dir)/browserify -t coffeeify --extension=".coffee" --debug src/index.coffee | $(bin_dir)/exorcist --base . $@.map > $@

.PHONY: build clean test watch

build: $(js_grammar) $(js_bundle)

clean:
	rm $(js_grammar) $(js_bundle)

test: build
	$(bin_dir)/mocha --growl --colors >/dev/null

watch: test
	@while true; do \
	  inotifywait \
	    --event modify,close_write,move,move_self,create,delete,delete_self \
	    --quiet --recursive \
	    src test; \
	  make --no-print-directory test; \
	done

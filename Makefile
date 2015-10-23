coffee_files = $(wildcard src/*.coffee)
bin_dir = node_modules/.bin
js_bundle = assets/index.js
min_js_bundle = assets/index.min.js

all: build

src/grammar.js: src/grammar.jison
	$(bin_dir)/jison -o $@ $<

$(js_bundle): $(coffee_files) src/grammar.js
	$(bin_dir)/browserify -t coffeeify --extension=".coffee" --debug src/index.coffee | $(bin_dir)/exorcist --base . $@.map > $@

$(min_js_bundle): $(js_bundle)
	$(bin_dir)/uglifyjs --in-source-map $(js_bundle).map --source-map $@.map --source-map-url index.min.js.map $(js_bundle) > $@

.PHONY: build clean test watch

build: $(min_js_bundle)

clean:
	rm -f src/grammar.js $(js_bundle) $(min_js_bundle)

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

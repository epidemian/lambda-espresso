bin_dir = node_modules/.bin
js_bundle = assets/index.js
min_js_bundle = assets/index.min.js

all: build

src/grammar.js: src/grammar.jison
	$(bin_dir)/jison -o $@ $<

$(js_bundle): src/*.js src/grammar.js
	$(bin_dir)/browserify --debug src/index.js | $(bin_dir)/exorcist --base . $@.map > $@

$(min_js_bundle): $(js_bundle)
	$(bin_dir)/uglifyjs --in-source-map $(js_bundle).map --source-map $@.map --source-map-url index.min.js.map $(js_bundle) > $@

.PHONY: build
build: $(js_bundle)

.PHONY: clean
clean:
	rm -f src/grammar.js $(js_bundle) $(min_js_bundle)

.PHONY: test
test: build
	$(bin_dir)/mocha --growl --colors

.PHONY: watch
watch:
	@while true; do \
	  make --no-print-directory test; \
	  inotifywait \
	    --event modify,close_write,move,move_self,create,delete,delete_self \
	    --quiet --recursive \
	    src test; \
	done

.PHONY: bench
bench:
	$(bin_dir)/node src/benchmark.js

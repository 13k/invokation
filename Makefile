LUA_SRC_PATH := game/scripts/vscripts
LUA_TEST_PATH := spec
JS_SRC_PATH := content/panorama/scripts
CSS_SRC_PATH := content/panorama/styles

.NOTPARALLEL:

.PHONY: all
all: format lint test doc build

.PHONY: format
format: format-lua format-js format-css

.PHONY: lint
lint: lint-lua lint-js lint-css

.PHONY: test
test: test-lua

.PHONY: doc
doc: doc-lua

.PHONY: link
link:
	@bash scripts/link.bash

.PHONY: build
build: link
	@bash scripts/build.bash

.PHONY: clean
clean:
	@bash scripts/clean.bash

.PHONY: launch-game
launch-game:
	@bash scripts/launch_game.bash

.PHONY: launch-tools
launch-tools:
	@bash scripts/launch_tools.bash

.PHONY: format-lua
format-lua:
	@yarn run format:lua

.PHONY: lint-lua
lint-lua:
	@luacheck "$(LUA_SRC_PATH)"
	@luacheck "$(LUA_TEST_PATH)"

.PHONY: doc-lua
doc-lua:
	@ldoc --unqualified .

.PHONY: test-lua
test-lua:
	@luarocks test

.PHONY:
build-lua: format-lua lint-lua doc-lua

.PHONY: format-js
format-js:
	@yarn run prettier --write "$(JS_SRC_PATH)/**/*.js"

.PHONY: lint-js
lint-js:
	@yarn run eslint "$(JS_SRC_PATH)"

.PHONY: format-css
format-css:
	@yarn run stylelint --fix "$(CSS_SRC_PATH)"
	@yarn run prettier --write "$(CSS_SRC_PATH)/**/*.css"

.PHONY: lint-css
lint-css:
	@yarn run stylelint "${CSS_SRC_PATH}"

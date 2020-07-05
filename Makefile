LUA_SRC_PATH := game/scripts/vscripts
LUA_TEST_PATH := spec
SCRIPTS_SRC_PATH := scripts
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
	@yarn run link

.PHONY: build
build: link
	@yarn run build

.PHONY: clean
clean:
	@yarn run clean

.PHONY: launch-game
launch-game:
	@yarn run launch:game

.PHONY: launch-tools
launch-tools:
	@yarn run launch:tools

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
	@yarn run prettier --write "$(SCRIPTS_SRC_PATH)/**/*.js" "$(JS_SRC_PATH)/**/*.js"

.PHONY: lint-js
lint-js:
	@yarn run eslint "$(SCRIPTS_SRC_PATH)/**/*.js" "$(JS_SRC_PATH)"

.PHONY: format-css
format-css:
	@yarn run stylelint --fix "$(CSS_SRC_PATH)"
	@yarn run prettier --write "$(CSS_SRC_PATH)/**/*.css"

.PHONY: lint-css
lint-css:
	@yarn run stylelint "${CSS_SRC_PATH}"

LUA_SRC_PATH := game/scripts/vscripts
LUA_TEST_PATH := spec
JS_SRC_PATH := content/panorama/scripts
CSS_SRC_PATH := content/panorama/styles

.PHONY: format-lua format-js format-css lint-lua lint-js lint-css doc-lua test-lua clean install build launch-game launch-tools

format-lua:
	@yarn run prettier --write "$(LUA_SRC_PATH)/**/*.lua"

format-js:
	@yarn run prettier --write "$(JS_SRC_PATH)/**/*.js"

format-css:
	@yarn run stylelint --fix "$(CSS_SRC_PATH)"
	@yarn run prettier --write "$(CSS_SRC_PATH)/**/*.css"

lint-lua:
	@luacheck "$(LUA_SRC_PATH)"
	@luacheck "$(LUA_TEST_PATH)"

lint-js:
	@yarn run eslint "$(JS_SRC_PATH)"

lint-css:
	@yarn run stylelint "${CSS_SRC_PATH}"

doc-lua:
	@ldoc --unqualified .

test-lua:
	@busted

clean:
	@bash scripts/clean.bash

install:
	@bash scripts/install.bash

build:
	@bash scripts/build.bash

launch-game:
	@bash scripts/launch_game.bash

launch-tools:
	@bash scripts/launch_tools.bash

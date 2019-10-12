LUA_SRC_PATH := game/scripts/vscripts
JS_SRC_PATH := content/panorama/scripts
CSS_SRC_PATH := content/panorama/styles

.PHONY: lint lint_lua format_lua doc_lua lint_js format_js lint_css format_css clean install build launch_game launch_tools

format_lua:
	@yarn run prettier --write "$(LUA_SRC_PATH)/**/*.lua"

format_js:
	@yarn run prettier --write "$(JS_SRC_PATH)/**/*.js"

format_css:
	@yarn run stylelint --fix "$(CSS_SRC_PATH)"
	@yarn run prettier --write "$(CSS_SRC_PATH)/**/*.css"

lint_lua:
	@luacheck "$(LUA_SRC_PATH)"

lint_js:
	@yarn run eslint "$(JS_SRC_PATH)"

lint_css:
	@yarn run stylelint "${CSS_SRC_PATH}"

doc_lua:
	@ldoc --unqualified .

clean:
	@bash scripts/clean.bash

install:
	@bash scripts/install.bash

build:
	@bash scripts/build.bash

launch_game:
	@bash scripts/launch_game.bash

launch_tools:
	@bash scripts/launch_tools.bash

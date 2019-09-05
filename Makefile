LUA_SOURCES_PATH := game/scripts/vscripts
JS_SOURCES_PATH := content/panorama/scripts
CSS_SOURCES_PATH := content/panorama/styles

.PHONY: luacheck ldoc luafmt eslint stylelint stylelint_fix clean install build launch_game launch_tools

lint_lua:
	@luacheck "$(LUA_SOURCES_PATH)"

format_lua:
	@bash scripts/luafmt.bash "$(LUA_SOURCES_PATH)"

doc_lua:
	@ldoc --unqualified .

lint_js:
	@yarn run eslint "$(JS_SOURCES_PATH)"

format_js:
	@yarn run prettier --config ".prettierrc.yml" --parser babel --write "$(JS_SOURCES_PATH)/**/*.js"

lint_css:
	@yarn run stylelint "$(CSS_SOURCES_PATH)"

format_css:
	@yarn run stylelint --fix "$(CSS_SOURCES_PATH)"
	@yarn run prettier --config ".prettierrc.yml" --parser css --write "$(CSS_SOURCES_PATH)/**/*.css"

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

LUA_SOURCE := game/scripts/vscripts
STYLES_SOURCE := content/panorama/styles

luacheck:
	@luacheck "$(LUA_SOURCE)"

ldoc:
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

stylelint:
	@yarn stylelint "$(STYLES_SOURCE)"

stylelint_fix:
	@yarn stylelint --fix "$(STYLES_SOURCE)"

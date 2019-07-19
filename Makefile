LUA_SOURCE := game/scripts/vscripts

luacheck:
	@luacheck "$(LUA_SOURCE)"

ldoc:
	@ldoc --unqualified .

install:
	@bash scripts/install.bash

build:
	@bash scripts/build.bash

launch_game:
	@bash scripts/launch_game.bash

launch_tools:
	@bash scripts/launch_tools.bash

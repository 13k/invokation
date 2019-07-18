LUA_SOURCE := game/scripts/vscripts

luacheck:
	@luacheck "$(LUA_SOURCE)"

ldoc:
	@ldoc --unqualified .

install:
	@bash install.sh

build:
	@bash build.sh

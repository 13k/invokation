VSCRIPTS_SOURCE := game/scripts/vscripts
SCRIPTS_SOURCE := content/panorama/scripts
STYLES_SOURCE := content/panorama/styles

luacheck:
	@luacheck "$(VSCRIPTS_SOURCE)"

ldoc:
	@ldoc --unqualified .

eslint:
	@yarn eslint "$(SCRIPTS_SOURCE)"

stylelint:
	@yarn stylelint "$(STYLES_SOURCE)"

stylelint_fix:
	@yarn stylelint --fix "$(STYLES_SOURCE)"

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

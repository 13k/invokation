TASKS_SRC_PATH := scripts
VSCRIPTS_SRC_PATH := game/scripts/vscripts
PANORAMA_SCRIPTS_SRC_PATH := src/panorama/scripts
PANORAMA_STYLES_SRC_PATH := content/panorama/styles

.NOTPARALLEL:

.PHONY: all
all: format lint test build

.PHONY: format
format: format-panorama

.PHONY: lint
lint: lint-tasks lint-vscripts lint-panorama

.PHONY: test
test: test-vscripts

.PHONY: link
link:
	@npm run link

.PHONY: build
build: link
	@npm run build

.PHONY: clean
clean:
	@npm run clean

.PHONY: launch-game
launch-game:
	@npm run launch:game

.PHONY: launch-tools
launch-tools:
	@npm run launch:tools

.PHONY: lint-vscripts
lint-vscripts:
	@selene "$(VSCRIPTS_SRC_PATH)"

.PHONY: test-vscripts
test-vscripts:
	@luarocks test

.PHONY: build-vscripts
build-vscripts: lint-vscripts

.PHONY: build-luarocks
build-luarocks: build-vscripts

.PHONY: lint-tasks
lint-tasks:
	@npm exec -- eslint "$(TASKS_SRC_PATH)"

.PHONY: lint-panorama
lint-panorama: lint-panorama-scripts lint-panorama-styles

.PHONY: lint-panorama-scripts
lint-panorama-scripts:
	@npm exec -- eslint "$(PANORAMA_SCRIPTS_SRC_PATH)"

.PHONY: lint-panorama-styles
lint-panorama-styles:
	@npm exec -- stylelint "${PANORAMA_STYLES_SRC_PATH}"

.PHONY: format-panorama
format-panorama: format-panorama-styles

.PHONY: format-panorama-styles
format-panorama-styles:
	@npm exec -- stylelint --fix "$(PANORAMA_STYLES_SRC_PATH)"
	@npm exec -- prettier --write "$(PANORAMA_STYLES_SRC_PATH)/**/*.css"

PANORAMA_LAYOUTS_SRC_PATH := content/panorama/layout
PANORAMA_SCRIPTS_SRC_PATH := src/content/panorama/scripts
PANORAMA_STYLES_SRC_PATH := content/panorama/styles
TASKS_SRC_PATH := scripts
VSCRIPTS_SRC_PATH := game/scripts/vscripts

.NOTPARALLEL:
.DEFAULT_GOAL := help

.PHONY: all
all: format lint test build ## run all tasks

.PHONY: format
format: format-tasks format-vscripts format-panorama ## format everything

.PHONY: lint
lint: lint-tasks lint-vscripts lint-panorama ## lint everything

.PHONY: test
test: test-vscripts ## run all tests

.PHONY: link
link: ## link source files to game directories
	@npm run link

.PHONY: build
build: link ## build everything
	@npm run build

.PHONY: clean
clean: ## remove all compiled and generated links and files
	@npm run clean

.PHONY: launch-game
launch-game: ## launch game with custom game
	@npm run launch:game

.PHONY: launch-tools
launch-tools: ## launch tools with custom game
	@npm run launch:tools

.PHONY: format-vscripts
format-vscripts: ## format Lua vscripts
	@stylua --verify "$(VSCRIPTS_SRC_PATH)"

.PHONY: lint-vscripts
lint-vscripts: ## lint Lua vscripts
	@selene "$(VSCRIPTS_SRC_PATH)"

.PHONY: test-vscripts
test-vscripts: ## test Lua vscripts
	@luarocks test

.PHONY: build-luarocks
build-luarocks: lint-vscripts

.PHONY: format-tasks
format-tasks: ## format tasks files
	@npx @biomejs/biome format --write "$(TASKS_SRC_PATH)"

.PHONY: lint-tasks
lint-tasks: ## lint tasks files
	@npx eslint "$(TASKS_SRC_PATH)"

.PHONY: lint-panorama
lint-panorama: lint-panorama-scripts lint-panorama-styles ## lint panorama files

.PHONY: lint-panorama-scripts
lint-panorama-scripts: ## lint panorama scripts
	@npx eslint "$(PANORAMA_SCRIPTS_SRC_PATH)"

.PHONY: lint-panorama-styles
lint-panorama-styles: ## lint panorama styles
	@npx stylelint "${PANORAMA_STYLES_SRC_PATH}"

.PHONY: format-panorama
format-panorama: format-panorama-layouts format-panorama-scripts format-panorama-styles ## format all panorama files

.PHONY: format-panorama-layouts
format-panorama-layouts: ## format panorama layouts
	@npx prettier --write "$(PANORAMA_LAYOUTS_SRC_PATH)/**/*.xml"

.PHONY: format-panorama-scripts
format-panorama-scripts: ## format panorama scripts
	@npx @biomejs/biome format --write "$(PANORAMA_SCRIPTS_SRC_PATH)"

.PHONY: format-panorama-styles
format-panorama-styles: ## format panorama styles
	@npx stylelint --fix "$(PANORAMA_STYLES_SRC_PATH)"
	@npx prettier --write "$(PANORAMA_STYLES_SRC_PATH)/**/*.css"

help: ## Shows this usage
	@echo "Makefile"
	@echo ""
	@echo "Usage:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36mmake %-30s\033[0m %s.\n", $$1, $$2}'

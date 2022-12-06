TASKS_SRC_PATH := scripts
VSCRIPTS_SRC_PATH := game/scripts/vscripts
PANORAMA_SCRIPTS_SRC_PATH := src/panorama/scripts
PANORAMA_STYLES_SRC_PATH := content/panorama/styles

.NOTPARALLEL:
.DEFAULT_GOAL := help

.PHONY: all
all: format lint test build ## run all tasks

.PHONY: format
format: format-panorama ## format everything

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

.PHONY: lint-vscripts
lint-vscripts: ## lint Lua vscripts
	@selene "$(VSCRIPTS_SRC_PATH)"

.PHONY: test-vscripts
test-vscripts: ## test Lua vscripts
	@luarocks test

.PHONY: build-luarocks
build-luarocks: lint-vscripts

.PHONY: lint-tasks
lint-tasks: ## lint tasks files
	@npm exec -- eslint "$(TASKS_SRC_PATH)"

.PHONY: lint-panorama
lint-panorama: lint-panorama-scripts lint-panorama-styles ## lint panorama files

.PHONY: lint-panorama-scripts
lint-panorama-scripts: ## lint panorama scripts
	@npm exec -- eslint "$(PANORAMA_SCRIPTS_SRC_PATH)"

.PHONY: lint-panorama-styles
lint-panorama-styles: ## lint panorama styles
	@npm exec -- stylelint "${PANORAMA_STYLES_SRC_PATH}"

.PHONY: format-panorama
format-panorama: format-panorama-styles ## format panorama files

.PHONY: format-panorama-styles
format-panorama-styles: ## format panorama styles
	@npm exec -- stylelint --fix "$(PANORAMA_STYLES_SRC_PATH)"
	@npm exec -- prettier --write "$(PANORAMA_STYLES_SRC_PATH)/**/*.css"

help: ## Shows this usage
	@echo "Makefile"
	@echo ""
	@echo "Usage:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36mmake %-30s\033[0m %s.\n", $$1, $$2}'

.NOTPARALLEL:

.PHONY: help
help: ## Show help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: doc-vscripts
doc-vscripts: ## Generate vscript documentation
	@ldoc --unqualified .

.PHONY: lint-vscripts
lint-vscripts: ## Lint game vscript
	@luacheck .

.PHONY: test-vscripts
test-vscripts: ## Run vscript tests
	@luarocks test

# used by luarocks
.PHONY: rock-build
rock-build: lint-vscripts

# used by luarocks
.PHONY: rock-install
rock-install: doc-vscripts

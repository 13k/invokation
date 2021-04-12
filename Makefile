SCRIPTS_PATH := scripts
PANORAMA_JS_PATH := content/panorama/scripts
PANORAMA_CSS_PATH := content/panorama/styles
ESLINT_SCRIPTS_CONFIG := $(SCRIPTS_PATH)/.eslintrc.yml
ESLINT_PANORAMA_CONFIG := $(PANORAMA_JS_PATH)/.eslintrc.yml
ESLINT_PANORAMA_IGNORE := $(PANORAMA_JS_PATH)/.eslintignore
STYLELINT_PANORAMA_CONFIG := $(PANORAMA_CSS_PATH)/.stylelintrc.yml

.NOTPARALLEL:

.PHONY: all
all: format lint test doc build

.PHONY: format
format: format-lua format-js format-css

.PHONY: lint
lint: lint-lua lint-js lint-css

.PHONY: test
test: test-lua

.PHONY: doc
doc: doc-lua

.PHONY: clean
clean:
	@yarn run clean

.PHONY: build
build: link
	@yarn run build

.PHONY: link
link:
	@yarn run link

.PHONY: launch-tools
launch-tools:
	@yarn run launch:tools

.PHONY: launch-game
launch-game:
	@yarn run launch:game

.PHONY: format-lua
format-lua:
	@yarn run format:lua

.PHONY: lint-lua
lint-lua:
	@luacheck .

.PHONY: doc-lua
doc-lua:
	@ldoc --unqualified .

.PHONY: test-lua
test-lua:
	@luarocks test

.PHONY: format-js
format-js:
	@yarn run prettier --write "$(SCRIPTS_PATH)/**/*.js" "$(PANORAMA_JS_PATH)/**/*.js"

.PHONY: lint-js
lint-js: lint-js-scripts lint-js-panorama

.PHONY: lint-js-scripts
lint-js-scripts:
	@yarn run eslint \
		-c "$(ESLINT_SCRIPTS_CONFIG)" \
		--ignore-path "$(ESLINT_SCRIPTS_IGNORE)" \
		"$(SCRIPTS_PATH)"

.PHONY: lint-js-panorama
lint-js-panorama:
	@yarn run eslint \
		-c "$(ESLINT_PANORAMA_CONFIG)" \
		--ignore-path "$(ESLINT_PANORAMA_IGNORE)" \
		"$(PANORAMA_JS_PATH)"

.PHONY: format-css
format-css:
	@yarn run stylelint --fix "$(PANORAMA_CSS_PATH)"
	@yarn run prettier --write "$(PANORAMA_CSS_PATH)/**/*.css"

.PHONY: lint-css
lint-css:
	@yarn run stylelint "${PANORAMA_CSS_PATH}"

# used by luarocks
.PHONY: rock-build
rock-build: lint-lua

# used by luarocks
.PHONY: rock-install
rock-install: doc-lua

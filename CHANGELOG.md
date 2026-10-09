# Changelog

All notable changes to this project will be documented in this file.

## [0.5.5] - 2026-10-09

### 🚀 Features

- _(panorama)_ Update top bar
- _(map)_ Replace custom dummy target with hero demo dummy target
- _(game)_ Make aghanim's shard available to buy early
- _(game)_ Don't level up orbs on max level up
- _(panorama)_ Update combo controls and combat log UI
- _(game)_ Fix initial level and add ultra max level up option
- _(vscripts)_ Enable hero selection and strategy time for facet selection
- _(game)_ Enable `EnablePickRules` in addoninfo to fix hero picking

### 🐛 Bug Fixes

- _(vscripts)_ Fix game event `npc_spawned`
- _(panorama)_ Fix text entry popup
- _(panorama)_ Fix combo viewer
- _(vscripts)_ Update hero KeyValues format for patch 7.41f

### 🚜 Refactor

- _(vscripts)_ Reorganize settings
- _(panorama)_ [**breaking**] Convert styles to SCSS; change classes and ids naming to kebab-case
- _(panorama)_ Finish/fix refactoring; reorganize popups and tooltips
- _(panorama)_ Rework buttons and icons
- _(vscripts)_ Refactor console commands

### 📚 Documentation

- Update CHANGELOG
- Update README

### 🧪 Testing

- _(vscripts)_ Refactor tests; update types

### ⚙️ Miscellaneous Tasks

- _(lint)_ Upgrade biome
- Update tasks
- _(lint)_ Fix lint errors
- _(tasks)_ Remove eslint directives; add more debug logging
- _(tasks)_ Use `emmylua_check` when linting vscripts
- Replace linters and formatters:
- Format and fix lint errors
- _(dprint)_ Use single quotes for CSS (Valve implementation sucks)
- _(panorama)_ Reformat styles
- Compile panorama styles using `grass`; update panorama scripts building
- Separate build and resource compilation tasks
- Remove unused custom event `invk_player_quit_request`
- Disable panorama script minification
- Update tasks
- Update vscripts types; update linters configs; update tsconfigs
- _(lux)_ Add `middleclass` to test deps
- Update tasks
- _(dprint)_ Update plugins
- Format files
- Add (empty) taplo config
- Update bun lockfile with newest bun version
- _(lux)_ Update lockfile and emmyrc
- Fix ci workflow

## [0.5.4] - 2025-09-04

### 🚀 Features

- _(maps)_ Change player start position in `cottage`
- Add initial support for facets [wip]
- Add quit button
- _(ui)_ Reposition combo viewer and keep combo picker open when viewing details

### 🐛 Bug Fixes

- _(panorama)_ Fix built-in shop display
- _(panorama)_ Fix combat log toggle icon
- _(panorama)_ Enable aghanims status in HUD
- _(ui)_ Fix talents display in combo viewer (tooltip disabled)
- _(ui)_ Fix missing icon in combo picker
- Stop using self-referencing enums
- _(l10n)_ Rework keys; fix filters; refactor tag select code

### 🚜 Refactor

- _(tasks)_ Move tasks to `/src/tasks`
- _(panorama)_ [**breaking**] Migrate scripts to ESM on bun; reorganize components
- _(tasks)_ Filesystem code refactoring:

### 🧪 Testing

- Update luacov config

### ⚙️ Miscellaneous Tasks

- Update CI workflow
- [**breaking**] Use `bun` to run tasks
- [**breaking**] Update tasks to run on `bun`
- _(lint)_ Update biome config
- _(bun)_ Disable auto-install
- _(lint)_ Add biome config for panorama scripts
- Bundle panorama scripts with bun; fix `data kv` document validation
- Organize typescript in workspaces
- Update Taskfile
- Remove unused code
- Reorganize biome config
- _(lint)_ Update selene config
- Remove dead code
- Fix unique ids/cached objects in development mode

## [0.5.3] - 2024-06-02

### 🐛 Bug Fixes

- _(panorama)_ Fix typescript config
- _(panorama)_ Fix typescript errors
- _(vscript)_ Add ceiling to ability number when parsing talents KeyValues

### 🚜 Refactor

- _(build)_ Abstract paths and refactor commands
- _(panorama)_ Fix stylelint errors
- _(panorama)_ Reorganize and modernize scripts
- Fix biome errors and rename custom events

### 📚 Documentation

- Update DEVELOPMENT
- Update DEVELOPMENT
- Update CHANGELOG

### 🧪 Testing

- Update busted config

### ⚙️ Miscellaneous Tasks

- Update dev dependencies
- _(deps)_ Add `biome`
- Add biome config and update vscode recommended extensions
- Upgrade required nodejs version to latest LTS
- Update tsconfig base configs and extends
- _(deps)_ Add `@mojojs/path`
- _(deps)_ Add eslint biome config
- _(deps)_ Upgrade typescript and related
- _(lint)_ Update eslint config
- Update stylelint config
- _(deps)_ Add `shell-quote`
- _(deps)_ Add `dotenv-expand`
- Allow configuration of custom resource compiler command
- _(panorama)_ Fix eslint config
- Update lint and formatting configs
- Update make tasks
- Format files
- Replace Makefile with Taskfile
- Disable build in rockspec
- _(lint)_ Update selene config
- _(panorama)_ Fix linting errors
- _(deps)_ Add `core-js` types
- Update `.ignore`
- Update Taskfile
- _(lint)_ Replace eslint with biome
- _(vscode)_ Update settings and recommended extensions
- _(deps)_ Remove eslint
- _(luals)_ Add dota2 definitions
- _(selene)_ Update dota2 stdlib
- _(luals)_ Add busted and luassert definitions
- _(vscript)_ Upgrade penlight to 1.13.1
- _(luals)_ Add penlight definitions
- Extract `convert-shops` command to `data shops`; add subcommand `data keyvalues`
- _(lint)_ Update biome config
- _(lint)_ Fix biome errors
- _(luarocks)_ Update test deps
- _(gh)_ Add workflow
- _(gh)_ Enable `workflow_dispatch` on CI workflow
- Fix ci workflow
- Add `git-cliff` config

## [0.5.2] - 2023-12-08

### 🐛 Bug Fixes

- _(vscript)_ Update invoker abilities KeyValues file path

### 📚 Documentation

- Update DEVELOPMENT
- Update CHANGELOG

### ⚙️ Miscellaneous Tasks

- Bump version to 0.5.2

## [0.5.1] - 2023-10-14

### 🚀 Features

- _(map)_ Update overviews

### 🐛 Bug Fixes

- _(build)_ Change `link` command to work with `game` child paths
- _(panorama)_ Remove unused style imports from loading screen

### 📚 Documentation

- Update DEVELOPMENT
- Update CHANGELOG

### ⚙️ Miscellaneous Tasks

- Update gitignore
- _(lsp)_ Update config
- Update node packages
- Update map compilation params
- Update launch options
- Bump version

## [0.5.0] - 2023-01-21

### 🚀 Features

- _(panorama)_ Improve popups
- _(panorama)_ Improve combo viewer styles
- _(panorama)_ Improve ability picker and fix linting errors

### 🐛 Bug Fixes

- _(panorama)_ Fix damage rating filtering
- _(panorama)_ Update combo score and fix digits values
- _(panorama)_ Fix reentrant event listeners
- _(panorama)_ Patch vendored lodash to not use evaluated code

### 🚜 Refactor

- _(scripts)_ Remove `format-lua` and use `cjs` extension
- [**breaking**] Use npm instead of yarn, add typescript deps and configs
- _(build)_ [**breaking**] Rewrite scripts in typescript and refactor everything
- _(panorama)_ [**breaking**] Rewrite scripts in typescript and refactor everything
- _(panorama)_ [**breaking**] Use typescript compiler to compile and bundle scripts
- _(panorama)_ Automatic `onload` and parameterize component params
- _(panorama)_ Add panel events to components and fix item search
- _(panorama)_ Move script files
- _(panorama)_ Rename `elementEvents` to `uiEvents` component option
- _(panorama)_ Add context panel reference to component options
- _(panorama)_ Use built-in item list in item picker

### ⚙️ Miscellaneous Tasks

- Remove modmaker
- Upgrade js deps, update yarn sdks, update eslint config to use typescript
- [**breaking**] Remove ldoc, update luacov settings, update Makefile
- Update Makefile
- Update default repository branch
- _(stylelint)_ Update config
- Add ability to specify build parts and fix lint warnings
- _(panorama)_ Fix eslint warnings
- Fix build command and refactor commands
- Add node dev dep `@prettier/plugin-xml`
- Update editorconfig, eslint, prettier and stylelint configs
- _(lint)_ Move selene configuration files
- Update `prettier`
- Update prettier config
- _(panorama)_ Format layout files
- _(panorama)_ Remove unused comments
- Update CHANGELOG
- Bump version to 0.5.0

## [0.4.7] - 2022-11-20

### 🚀 Features

- Update map overviews
- _(scripts)_ Update `launch` command
- _(l10n)_ Update note about optional combo steps

### 🐛 Bug Fixes

- _(vscripts)_ Use case-sensitive requires
- _(l10n)_ Localization keys require the "#" prefix
- _(l10n)_ Use "#" prefix in static keys
- _(vscript)_ Add hack to `entity_hurt` game event to fix an issue with units being killed with
  `ForceKill`
- _(l10n)_ Allow `Localize` to receive a panel as context
- _(panorama)_ Update hard-coded talents
- _(panorama)_ Update talents display UI
- _(panorama)_ Fix (partially) talents display
- _(panorama)_ Improve steps icon borders and fix optional steps showing as required
- _(panorama)_ Improve box-shadow on icons

### 🚜 Refactor

- _(scripts)_ Move command files to separate directory
- Change nettables constants, add kv nettables and fix lint errors

### ⚙️ Miscellaneous Tasks

- _(git)_ Ignore `/build` and `/.vscode`
- _(git)_ Ignore `/.luarc.json`
- _(git)_ Ignore `/game/*` except source files
- Update shops
- Upgrade yarn and editor sdks
- Upgrade stylelint
- Update vscode settings
- Update stylelint config
- Replace luacheck with selene
- Replace lua-format with stylua
- Update `.ignore`
- _(vscode)_ Use sumneko-lua language server
- _(lsp)_ Add config
- Format lua files
- Rebuild cottage map
- Bump version to 0.4.7
- Update CHANGELOG

## [0.4.6-beta1] - 2021-05-12

## [0.4.5-beta1] - 2021-03-06

## [0.4.4-beta1] - 2021-03-06

## [0.4.3-beta1] - 2021-02-25

## [0.4.2-beta1] - 2019-10-16

## [0.4.1-beta1] - 2019-10-03

## [0.4.0-beta1] - 2019-09-30

## [0.3.0-beta1] - 2019-09-24

## [0.2.0-beta1] - 2019-09-16

## [0.1.0-beta1] - 2019-07-21

<!-- generated by git-cliff -->

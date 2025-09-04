# Changelog

All notable changes to this project will be documented in this file.

## [0.5.4] - 2025-09-04

### 🚀 Features

- *(maps)* Change player start position in `cottage`
- Add initial support for facets (WIP)
- Add quit button
- *(ui)* Reposition combo viewer and keep combo picker open when viewing details
- improve hero reset

### 🐛 Bug Fixes

- *(panorama)* Fix built-in shop display
- *(panorama)* Fix combat log toggle icon
- *(panorama)* Enable aghanims status in HUD
- *(ui)* Fix talents display in combo viewer (tooltip disabled)
- *(ui)* Fix missing icon in combo picker
- Stop using self-referencing enums
- *(l10n)* Rework keys; fix filters; refactor tag select code
- *(ui)*: Fix item picker

### 🚜 Refactor

- *(tasks)* Move tasks to `/src/tasks`
- *(panorama)* [**breaking**] Migrate scripts to ESM on bun; reorganize components
- *(tasks)* Filesystem code refactoring:
- *(vscripts)* [**breaking**] Major vscripts refactoring:
  - add `compat53`
  - remove `penlight` and `moses`
    - add `middleclass` for classes
    - add `inspect` for value formatting
    - manually implement table/function/string utils
  - reorganization
    - rename top-level module `invokation` to `invk`
    - extract and reorganize a lot of code
    - remove a lot of unused code
    - rewrite/refactor tests support code
  - types
    - replace ldoc tags with emmylua_ls tags (LuaCATS)
  - code style
    - use snake_case
  - probably a hell of a lot of other things

### 🧪 Testing

- Remove luacov

### ⚙️ Miscellaneous Tasks

- Update CI workflow
- [**breaking**] Use `bun` to run tasks
- [**breaking**] Update tasks to run on `bun`
- *(lint)* Update biome config
- *(bun)* Disable auto-install
- *(lint)* Add biome config for panorama scripts
- Bundle panorama scripts with bun; fix `data kv` document validation
- Organize typescript in workspaces
- Update Taskfile
- Remove unused code
- Reorganize biome config
- *(lint)* Update selene config
- Remove dead code
- Fix unique ids/cached objects in development mode
- [**breaking**] replace luarocks with lux
- [**breaking**] replace luals with emmylua_ls
- *(lint)* update luacats types and selene stdlibs
- [**breaking**] update tasks to use lux
- update javascript dependencies
- update selene config

### 📚 Documentation

- update DEVELOPMENT

## [0.5.3] - 2024-06-02

### 🐛 Bug Fixes

- *(panorama)* Fix typescript config
- *(panorama)* Fix typescript errors
- *(vscript)* Add ceiling to ability number when parsing talents KeyValues

### 🚜 Refactor

- *(build)* Abstract paths and refactor commands
- *(panorama)* Fix stylelint errors
- *(panorama)* Reorganize and modernize scripts
- Fix biome errors and rename custom events

### 📚 Documentation

- Update DEVELOPMENT
- Update DEVELOPMENT
- Update CHANGELOG

### 🧪 Testing

- Update busted config

### ⚙️ Miscellaneous Tasks

- Update dev dependencies
- *(deps)* Add `biome`
- Add biome config and update vscode recommended extensions
- Upgrade required nodejs version to latest LTS
- Update tsconfig base configs and extends
- *(deps)* Add `@mojojs/path`
- *(deps)* Add eslint biome config
- *(deps)* Upgrade typescript and related
- *(lint)* Update eslint config
- Update stylelint config
- *(deps)* Add `shell-quote`
- *(deps)* Add `dotenv-expand`
- Allow configuration of custom resource compiler command
- *(panorama)* Fix eslint config
- Update lint and formatting configs
- Update make tasks
- Format files
- Replace Makefile with Taskfile
- Disable build in rockspec
- *(lint)* Update selene config
- *(panorama)* Fix linting errors
- *(deps)* Add `core-js` types
- Update `.ignore`
- Update Taskfile
- *(lint)* Replace eslint with biome
- *(vscode)* Update settings and recommended extensions
- *(deps)* Remove eslint
- *(luals)* Add dota2 definitions
- *(selene)* Update dota2 stdlib
- *(luals)* Add busted and luassert definitions
- *(vscript)* Upgrade penlight to 1.13.1
- *(luals)* Add penlight definitions
- Extract `convert-shops` command to `data shops`; add subcommand `data keyvalues`
- *(lint)* Update biome config
- *(lint)* Fix biome errors
- *(luarocks)* Update test deps
- *(gh)* Add workflow
- *(gh)* Enable `workflow_dispatch` on CI workflow
- Fix ci workflow
- Add `git-cliff` config

## [0.5.2] - 2023-12-08

### 🐛 Bug Fixes

- *(vscript)* Update invoker abilities KeyValues file path

### 📚 Documentation

- Update DEVELOPMENT
- Update CHANGELOG

### ⚙️ Miscellaneous Tasks

- Bump version to 0.5.2

## [0.5.1] - 2023-10-14

### 🚀 Features

- *(map)* Update overviews

### 🐛 Bug Fixes

- *(build)* Change `link` command to work with `game` child paths
- *(panorama)* Remove unused style imports from loading screen

### 📚 Documentation

- Update DEVELOPMENT
- Update CHANGELOG

### ⚙️ Miscellaneous Tasks

- Update gitignore
- *(lsp)* Update config
- Update node packages
- Update map compilation params
- Update launch options
- Bump version

## [0.5.0] - 2023-01-21

### 🚀 Features

- *(panorama)* Improve popups
- *(panorama)* Improve combo viewer styles
- *(panorama)* Improve ability picker and fix linting errors

### 🐛 Bug Fixes

- *(panorama)* Fix damage rating filtering
- *(panorama)* Update combo score and fix digits values
- *(panorama)* Fix reentrant event listeners
- *(panorama)* Patch vendored lodash to not use evaluated code

### 🚜 Refactor

- *(scripts)* Remove `format-lua` and use `cjs` extension
- [**breaking**] Use npm instead of yarn, add typescript deps and configs
- *(build)* [**breaking**] Rewrite scripts in typescript and refactor everything
- *(panorama)* [**breaking**] Rewrite scripts in typescript and refactor everything
- *(panorama)* [**breaking**] Use typescript compiler to compile and bundle scripts
- *(panorama)* Automatic `onload` and parameterize component params
- *(panorama)* Add panel events to components and fix item search
- *(panorama)* Move script files
- *(panorama)* Rename `elementEvents` to `uiEvents` component option
- *(panorama)* Add context panel reference to component options
- *(panorama)* Use built-in item list in item picker

### ⚙️ Miscellaneous Tasks

- Remove modmaker
- Upgrade js deps, update yarn sdks, update eslint config to use typescript
- [**breaking**] Remove ldoc, update luacov settings, update Makefile
- Update Makefile
- Update default repository branch
- *(stylelint)* Update config
- Add ability to specify build parts and fix lint warnings
- *(panorama)* Fix eslint warnings
- Fix build command and refactor commands
- Add node dev dep `@prettier/plugin-xml`
- Update editorconfig, eslint, prettier and stylelint configs
- *(lint)* Move selene configuration files
- Update `prettier`
- Update prettier config
- *(panorama)* Format layout files
- *(panorama)* Remove unused comments
- Update CHANGELOG
- Bump version to 0.5.0

## [0.4.7] - 2022-11-20

### 🚀 Features

- Update map overviews
- *(scripts)* Update `launch` command
- *(l10n)* Update note about optional combo steps

### 🐛 Bug Fixes

- *(vscripts)* Use case-sensitive requires
- *(l10n)* Localization keys require the "#" prefix
- *(l10n)* Use "#" prefix in static keys
- *(vscript)* Add hack to `entity_hurt` game event to fix an issue with units being killed with `ForceKill`
- *(l10n)* Allow `Localize` to receive a panel as context
- *(panorama)* Update hard-coded talents
- *(panorama)* Update talents display UI
- *(panorama)* Fix (partially) talents display
- *(panorama)* Improve steps icon borders and fix optional steps showing as required
- *(panorama)* Improve box-shadow on icons

### 🚜 Refactor

- *(scripts)* Move command files to separate directory
- Change nettables constants, add kv nettables and fix lint errors

### ⚙️ Miscellaneous Tasks

- *(git)* Ignore `/build` and `/.vscode`
- *(git)* Ignore `/.luarc.json`
- *(git)* Ignore `/game/*` except source files
- Update shops
- Upgrade yarn and editor sdks
- Upgrade stylelint
- Update vscode settings
- Update stylelint config
- Replace luacheck with selene
- Replace lua-format with stylua
- Update `.ignore`
- *(vscode)* Use sumneko-lua language server
- *(lsp)* Add config
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

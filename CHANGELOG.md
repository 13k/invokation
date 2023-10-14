# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog][kacl], and this project adheres to
[Semantic Versioning][semver].

## [Unreleased][unreleased]

Latest commits not yet released.

## [0.5.1] - 2023-10-14

### Development

- Update build and fix errors for building for 7.34

## [0.5.0] - 2023-01-21

### Gameplay

- Fixed game not working properly after Valve's V8 update (#34)

### UI

- Changed item filter to use built-in item list
- Improved ability filter
- Minor improvement to popups
- Minor improvement to combo viewer

### Development

- Use npm instead of yarn
- Rewrite of panorama scripts in typescript
- Rewrite of build scripts in typescript
- Updated build tasks to use typescript compiler to create javascript bundles used in panorama layouts

## [0.4.7] - 2022-11-20

### Gameplay

- Added new items to items filter (#20)

### UI

- Fixed localization (#17)
- Improved borders appearence (#18)
- Fixed talents not showing properly in combo viewer (#19)

### Development

- Replaced luacheck with [selene](https://github.com/Kampfkarren/selene)
- Replaced lua-format with [stylua](https://github.com/JohnnyMorganz/StyLua)
- Use [sumneko/lua-language-server](https://github.com/sumneko/lua-language-server) as language server
- Upgraded styling
- Upgraded yarn
- Refactor scripts

## [0.4.6-beta1] - 2021-05-12

### Gameplay

- Fixed issues preventing the game to start caused by patch 7.29 updates

## [0.4.5-beta1] - 2021-03-06

- UI bugfixes (talents in combo description, combo damage filter, game info popup)
- Added ambient sound effects to cottage map

## [0.4.4-beta1] - 2021-03-06

- Minor UI and map updates

## [0.4.3-beta1] - 2021-02-25

### Gameplay

- Fixed freestyle mode not starting
- Update hero max level to 30
- Updated shop
- Changed dummy target to be more tanky
- Fixed possible infinite loop when leveling abilities up
- Re-enabled island map

### Development

- Refactored a lot of lua code
- Set up project as luarocks rock
- Added test suite for lua code
- Upgraded to yarn 2.x
- Added an `.ico` image

## [0.4.2-beta1] - 2019-10-16

- Fixed combo score not showing correct damage values
- Fixed item picker search
- Fixed combo restart

## [0.4.1-beta1] - 2019-10-03

- Fixed lingering damage after combo finished not being counted towards total
  damage
- Fixed combo score clipping channeling bars
- Fixed meteor sound entering an infinite loop if the combo was restarted
  while the sound was playing

## [0.4.0-beta1] - 2019-09-30

- Combo picker now marks combos as finished.
- Added recommended skill build to combos (shown in combo details).

## [0.3.0-beta1] - 2019-09-24

- Reworked map (added new default map `cottage` and renamed the original map
  to `island`).
- Fixed item picker UI.

## [0.2.0-beta1] - 2019-09-16

Initial open beta release.

- Added two reset modes to combos: restart combo (keep hero state and restart
  combo) and reset hero (reset hero state and restart combo).
- Fixed spawned units lingering on combo finish/restart.
- Fixed abilities cooldowns not resetting on combo finish/restart.
- Fixed dropped items lingering on combo finish/restart.
- Added option to hide combo sequence or the whole HUD when playing combos.
- Changed the filter in the combat log to filter invocations (orb abilities and
  invoke).
- Changed combat log to always remain closed (can be opened manually) and
  always log spells (can be cleared with "Clear" button).
- "Useless" abilities in combos and combat log (treads switching, etc) are now
  ignored.
- Disabled debug logging for Panorama scripts in production environment.
- Converted combo category (laning phase, teamfight, etc) to free-form
  (non-localized) tags.
- Added combo properties to combo details viewer.
- Added a stopwatch clock measuring combo completion time.
- Added a freestyle mode.
- Added game information popup.
- Added filters to combo picker.
- Several UI/sound changes.

## [0.1.0-beta1] - 2019-07-21

Initial closed beta release.

[0.1.0-beta1]: https://github.com/13k/invokation/releases/tag/v0.1.0-beta1
[0.2.0-beta1]: https://github.com/13k/invokation/releases/tag/v0.2.0-beta1
[0.3.0-beta1]: https://github.com/13k/invokation/releases/tag/v0.3.0-beta1
[0.4.0-beta1]: https://github.com/13k/invokation/releases/tag/v0.4.0-beta1
[0.4.1-beta1]: https://github.com/13k/invokation/releases/tag/v0.4.1-beta1
[0.4.2-beta1]: https://github.com/13k/invokation/releases/tag/v0.4.2-beta1
[0.4.3-beta1]: https://github.com/13k/invokation/releases/tag/v0.4.3-beta1
[0.4.4-beta1]: https://github.com/13k/invokation/releases/tag/v0.4.4-beta1
[0.4.5-beta1]: https://github.com/13k/invokation/releases/tag/v0.4.5-beta1
[0.4.6-beta1]: https://github.com/13k/invokation/releases/tag/v0.4.6-beta1
[0.4.7]: https://github.com/13k/invokation/releases/tag/v0.4.7
[0.5.0]: https://github.com/13k/invokation/releases/tag/v0.5.0
[0.5.1]: https://github.com/13k/invokation/releases/tag/v0.5.1
[unreleased]: https://github.com/13k/invokation/compare/v0.5.1...HEAD
[kacl]: https://keepachangelog.com/en/1.0.0/
[semver]: https://semver.org/spec/v2.0.0.html

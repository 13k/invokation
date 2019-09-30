# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog][kacl], and this project adheres to
[Semantic Versioning][semver].

## [Unreleased][unreleased]

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

[unreleased]: https://github.com/13k/invokation/compare/v0.4.0-beta1...HEAD
[0.1.0-beta1]: https://github.com/13k/invokation/releases/tag/v0.1.0-beta1
[0.2.0-beta1]: https://github.com/13k/invokation/releases/tag/v0.2.0-beta1
[0.3.0-beta1]: https://github.com/13k/invokation/releases/tag/v0.3.0-beta1
[0.4.0-beta1]: https://github.com/13k/invokation/releases/tag/v0.4.0-beta1
[kacl]: https://keepachangelog.com/en/1.0.0/
[semver]: https://semver.org/spec/v2.0.0.html

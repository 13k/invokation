# Development

## Requirements

- [lua](https://lua.org) 5.1 (same version as Dota 2)
- [luarocks](https://luarocks.org)
- [node](https://nodejs.org) LTS + npm
- [task](https://taskfile.dev)

## Setup

- Create a `.env` file at the root of the project containing:

```shell
DOTA2_PATH="/path/to/dota2"
```

- Install node packages:

```shell
npm install
```

- Initialize luarocks:

```shell
luarocks init
```

- Add `<project_dir>/lua_modules/bin` to the `PATH`.

## Testing

Run tests:

```shell
task test
```

## Building

```shell
task build
```

## Release

- Update `CHANGELOG.md` and commit changes

  - Add release notes the top

  ```markdown
  ## [{version}] - {date}

  {notes}
  ```

  - Update links at the bottom

  ```markdown
  [{version}]: https://github.com/13k/invokation/releases/tag/v{version}
  [unreleased]: https://github.com/13k/invokation/compare/v{version}...HEAD
  ```

- Update version strings and commit changes

  - `game/scripts/vscripts/invokation/const/metadata.lua`
  - `src/content/panorama/scripts/lib/constants.ts`

- Rebuild and test version changes in UI

- Create and push tag

  ```shell
  git tag -m "version {version}" v{version}
  git push --follow-tags
  ```

- Create release on GitHub from [tag](https://github.com/13k/invokation/tags)

- Publish release to Steam Workshop

  Change note template:

  ```plaintext
  v{version}

  ### Gameplay

  - ...

  ### UI

  - ...

  ---

  Issues: https://github.com/13k/invokation/issues
  ```

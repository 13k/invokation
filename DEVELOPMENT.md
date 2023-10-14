# Development

## Requirements

All development is done within a WSL environment with the following setup:

- lua 5.1 (same version as Dota 2)
- luarocks
- node LTS + npm

## Setup

- Create a `.env` file at the root of the project containing:

```shell
DOTA2_PATH="/WSL/path/to/dota2"
```

- Install node packages:

```shell
npm install
```

- Initialize luarocks:

```shell
luarocks init
```

- Edit `.luarocks/config-5.1.lua` and add:

```lua
rocks_servers = {
  "https://luarocks.org/repositories/rocks",
  "https://luarocks.org/dev",
}
```

- Add `<project_dir>/lua_modules/bin` to the `PATH`.

## Testing

Run tests:

```shell
luarocks test
```

## Building

```shell
make build
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
  - `src/content/panorama/scripts/lib/const.ts`

- Rebuild and test version changes in UI

- Create and push tag

  ```shell
  git tag -m "version {version}" v{version}
  git push --follow-tags
  ```

- Publish release to Steam Workshop

  Change note template:

  ```
  v{version}

  ### Gameplay

  - ...

  ### UI

  - ...

  ---

  Issues: https://github.com/13k/invokation/issues
  ```

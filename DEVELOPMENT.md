# Development

This repository follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
specification for commit messages.

## Requirements

- [lua](https://lua.org) 5.1 (same version as Dota 2)
- [luarocks](https://luarocks.org)
- [node](https://nodejs.org) LTS + npm
- [task](https://taskfile.dev)
- [git-cliff](https://git-cliff.org) (releases only)

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
luarocks init --local
```

- Add `<project_dir>/lua_modules/bin` to the `PATH`.

---

### A note about rocks tree isolation

Custom rocks trees defined with `rocks_trees` in a LuaRocks user config
(usually at `$HOME/.config/luarocks/config.lua` or `$HOME/.luarocks/config.lua`)
will get added to the project's `rocks_trees` config too
(this is a LuaRocks specific behavior).

To truly isolate the project tree from everything else, I recommend appending
the following to `<PROJECT_ROOT>/.luarocks/config-5.1.lua`
(after running `luarocks init`):

```lua
rocks_trees = {}
```

Then verify LuaRocks is using only the projects rocks tree by running:

```shell
luarocks config rocks_trees
```

It should print something like this:

```lua
{
   {
      name = "project",
      root = "<PROJECT_ROOT>/lua_modules"
   }
}
```

---

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

- Update changelog:

  - Re-generate file with `git-cliff`

    ```shell
    git-cliff --bump -o CHANGELOG.md
    ```

  - Commit changes

- Update version

  - Update version strings

    - `game/scripts/vscripts/invokation/const/metadata.lua`
    - `src/content/panorama/scripts/lib/constants.ts`

  - Commit changes with `chore(release)` label

    ```shell
    git commit -m "chore(release): version <VERSION>"
    ```

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

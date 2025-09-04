# Development

This repository follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
specification for commit messages.

## Requirements

- [luajit](https://luajit.org) 2.1 (same version as Dota 2)
- [lux](https://nvim-neorocks.github.io)
- [bun](https://bun.com)
- [task](https://taskfile.dev)
- [git-cliff](https://git-cliff.org) (releases only)

## Setup

- Create a `.env` file at the root of the project containing:

```shell
DOTA2_PATH="/path/to/dota2"
```

- Install node packages:

```shell
bun install
```

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

    - `game/scripts/vscripts/invk/const/metadata.lua`
    - `src/content/panorama/scripts/lib/meta.ts`

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

# Invokation development

## Requirements

All development is done within a WSL environment with the following setup:

- lua 5.1 (same version as Dota 2)
- luarocks
- node LTS
- yarn >= 1.22.4 (installed globally)
  - yarn 3.x will be installed and used in project

## Setup

- Create a `.env` file at the root of the project containing:

```shell
DOTA2_PATH="/WSL/path/to/dota2"
```

- Install node packages:

```shell
yarn install
```

- Initialize luarocks:

```shell
luarocks init
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

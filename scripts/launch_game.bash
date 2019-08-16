#!/bin/bash

if [ -z "$BASH_VERSION" ]; then
  echo >&2 "This script must be run with bash."
  exit 1
fi

if [[ -z "$WSL_DISTRO_NAME" ]]; then
  echo >&2 "This script must be run within WSL."
  exit 1
fi

set -e

SCRIPT_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

# shellcheck source="./common.bash"
source "$SCRIPT_DIR/common.bash"

opts=("+dota_launch_custom_game" "$ADDON" "$ADDON_MAP")
cmd=("$DOTA2_BIN_PATH" "${opts[@]}")

echo "> ${cmd[*]}"
cd "$DOTA2_PATH"
exec "${cmd[@]}"

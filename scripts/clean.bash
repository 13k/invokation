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

paths=(
  "$ADDON_CONTENT_PATH"
  "$ADDON_GAME_PATH"
)

echo "Removing addon from $DOTA2_PATH"

for path in "${paths[@]}"; do
  echo " * $path"
  rm -rf "$path" || abort "Error removing '$path'"
done

echo "Done"

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

opts=(
  "--line-width" "100"
  "--indent-count" "2"
  "--write-mode" "replace"
)

while read -r vscript; do
  yarn luafmt "${opts[@]}" "$vscript" || \
    abort "Error formatting file '$vscript'"
done < <(find "$VSCRIPTS_PATH" -type f -name "*.lua")

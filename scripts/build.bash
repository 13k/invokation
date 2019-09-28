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

compile() {
  local args=("$@")

  if [[ -n "$FORCE_BUILD" ]]; then
    args=("${args[@]}" "-fshallow")
  fi

  local cmd=("$RSRCC_BIN_PATH" "${args[@]}")

  pushd "$DOTA2_PATH" >/dev/null &&
    echo "> ${cmd[*]}" &&
    "${cmd[@]}" &&
    popd >/dev/null
}

# Compile maps individually.
# Recursive compilation including maps seems to break the compiler.

SRC_MAPS_PATH="$SRC_CONTENT_PATH/maps"
ADDON_MAPS_REL_PATH="$ADDON_CONTENT_REL_PATH/maps"

readarray -t maps < <(find "$SRC_MAPS_PATH" -name '*.vmap' -printf '%P\n')

for map in "${maps[@]}"; do
  compile -i "$ADDON_MAPS_REL_PATH/$map" || exit $?
done

# Compile all other resources.

filelist="$(mktemp)"

find "$SRC_CONTENT_PATH" -path "$SRC_MAPS_PATH" -prune -o -type f -printf "$ADDON_CONTENT_REL_PATH/%P\\n" >"$filelist"

compile -filelist "$(wslpath -w "$filelist")"

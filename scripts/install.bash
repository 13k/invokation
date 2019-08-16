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

echo "Linking addon from $ROOT_PATH to $DOTA2_PATH"

mkdir -vp "$DOTA2_ADDONS_CONTENT_PATH"
mkdir -vp "$ADDON_GAME_PATH"

if [[ ! -e "$ADDON_CONTENT_PATH" ]]; then
  mklink "$SRC_CONTENT_PATH" "$ADDON_CONTENT_PATH"
fi

while read -r rel_path; do
  src="$SRC_GAME_PATH/$rel_path"
  dest="$ADDON_GAME_PATH/$rel_path"

  echo -n " * $src -> $dest "

  if [[ -e "$dest" ]]; then
    echo "skip"
    continue
  fi

  echo "link"
  mkdir -vp "$(dirname "$dest")" || abort "Error creating directory '$dest'"
  mklink "$src" "$dest" || abort "Error linking '$src' to '$dest'"
done < <(find "$SRC_GAME_PATH" -mindepth 1 -maxdepth 1 -printf "%P\\n")

echo "Done"

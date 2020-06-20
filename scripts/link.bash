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

create_link() {
  local src="$1" dest="$2"

  echo -n " * $src -> $dest "

  if [[ -e "$dest" ]]; then
    echo "skip"
    return 0
  fi

  echo "link"

  mkdir -vp "$(dirname "$dest")" &&
    mklink "$src" "$dest"
}

echo "Linking addon from $ROOT_PATH to $DOTA2_PATH"

declare -A links=(
  ["$SRC_CONTENT_PATH"]="$ADDON_CONTENT_PATH"
)

while read -r rel_path; do
  src="$SRC_GAME_PATH/$rel_path"
  dest="$ADDON_GAME_PATH/$rel_path"
  links["$src"]="$dest"
done < <(find "$SRC_GAME_PATH" -mindepth 1 -maxdepth 1 -printf "%P\\n")

for src in "${!links[@]}"; do
  dest="${links["$src"]}"
  create_link "$src" "$dest" || abort "Error linking '$src' to '$dest'"
done

echo "Done"

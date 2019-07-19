#!/bin/bash
# This script is intended to be run within WSL

set -e

SCRIPT_PATH="$(dirname "$(realpath "$0")")"
SRC_PATH="$(dirname "$SCRIPT_PATH")"

source "$SCRIPT_PATH/common.bash"

src_content_path="$SRC_PATH/content"
src_game_path="$SRC_PATH/game"

dota_addons_content_path="$DOTA_PATH/content/dota_addons"
dota_addons_game_path="$DOTA_PATH/game/dota_addons"

target_content_path="$dota_addons_content_path/$ADDON"
target_game_path="$dota_addons_game_path/$ADDON"

echo "Linking addon from $SRC_PATH to $DOTA_PATH"

mkdir -vp "$dota_addons_content_path"
mkdir -vp "$target_game_path"

if [[ ! -e "$target_content_path" ]]; then
  mklink "$src_content_path" "$target_content_path"
fi

for src in "$src_game_path"/*; do
  dest="$target_game_path/$path"

  [[ -e "$dest" ]] && continue

  mkdir -vp "$(dirname "$dest")"
  mklink "$src" "$dest" || break
done

echo "Done"

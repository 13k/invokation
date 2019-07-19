#!/bin/bash
# This script is intended to be run within WSL

set -e

SCRIPT_PATH="$(dirname "$(realpath "$0")")"

source "$SCRIPT_PATH/common.bash"

dota_addons_content_path="$DOTA_PATH/content/dota_addons"
dota_addons_game_path="$DOTA_PATH/game/dota_addons"

target_content_path="$dota_addons_content_path/$ADDON"
target_game_path="$dota_addons_game_path/$ADDON"

echo "Removing addon from $DOTA_PATH"

rm -vrf "$target_content_path"
rm -vrf "$target_game_path"

echo "Done"

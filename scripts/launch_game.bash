#!/bin/bash
# This script is intended to be run within WSL

set -e

SCRIPT_PATH="$(dirname "$(realpath "$0")")"

source "$SCRIPT_PATH/common.bash"
cd "$DOTA_PATH"

"$DOTA_BIN_PATH" +dota_launch_custom_game "$ADDON" "$ADDON_MAP"

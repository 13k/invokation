#!/bin/bash
# This script is intended to be run within WSL

set -e

SCRIPT_PATH="$(dirname "$(realpath "$0")")"

source "$SCRIPT_PATH/common.bash"
cd "$DOTA_PATH"

"$TOOLS_BIN_PATH" -addon "$ADDON"

#!/bin/bash
# This script is intended to be run within WSL

set -e

SCRIPT_PATH="$(dirname "$(realpath "$0")")"

source "$SCRIPT_PATH/common.bash"
cd "$DOTA_PATH"

"$RESOURCE_COMPILER" -i "content/dota_addons/$ADDON/*" -r -fshallow

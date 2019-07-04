#!/bin/bash

# This script is intended to be run within WSL

ADDON="${ADDON:-invokation}"
DOTA_PATH="${DOTA_PATH:-"/mnt/f/SteamLibrary/steamapps/common/dota 2 beta"}"
RESOURCE_COMPILER="$DOTA_PATH/game/bin/win64/resourcecompiler.exe"

cd "$DOTA_PATH"

"$RESOURCE_COMPILER" -i "content/dota_addons/$ADDON/*" -r -fshallow
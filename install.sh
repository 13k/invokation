#!/bin/bash

# This script is intended to be run within WSL

translate_path() {
  echo "$1" | \sed -re 's#^/mnt/([a-z])#\1:#' -e 's#/#\\#g'
}

mklink() {
  local src="$1" dest="$2" src_t dest_t
  local args=()

  src_t="$(translate_path "$src")" || return $?
  dest_t="$(translate_path "$dest")" || return $?

  [[ -d "$src" ]] && args=("${args[@]}" "/j")

  cmd.exe /c mklink "${args[@]}" "$dest_t" "$src_t"
}

set -e

ADDON="${ADDON:-invokation}"
DOTA_PATH="${DOTA_PATH:-"/mnt/f/SteamLibrary/steamapps/common/dota 2 beta"}"

src_path="$(dirname "$(realpath "$0")")"
src_content_path="$src_path/content"
src_game_path="$src_path/game"

dota_addons_content_path="$DOTA_PATH/content/dota_addons"
dota_addons_game_path="$DOTA_PATH/game/dota_addons"

target_content_path="$dota_addons_content_path/$ADDON"
target_game_path="$dota_addons_game_path/$ADDON"

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
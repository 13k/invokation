SCRIPT_PATH="$(realpath "${BASH_SOURCE[0]}")"

if [[ "$(realpath "$0")" == "$SCRIPT_PATH" ]]; then
  echo >&2 "This file must be sourced, not executed directly."
  exit 1
fi

abort() {
  echo >&2 "$@"
  exit 1
}

mklink() {
  local src="$1" dest="$2" src_t dest_t
  local args=()

  src_t="$(wslpath -w "$src")" || return $?
  dest_t="$(wslpath -w "$dest")" || return $?

  [[ -d "$src" ]] && args=("${args[@]}" "/j")

  cmd.exe /c mklink "${args[@]}" "$dest_t" "$src_t"
}

SCRIPT_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
ROOT_PATH="$(dirname "$SCRIPT_DIR")"

ADDON="invokation"
ADDON_MAP="invokation"

# All paths below are unix. Convert using `wslpath`.

DOTA2_PATH="${DOTA2_PATH:-"/mnt/f/SteamLibrary/steamapps/common/dota 2 beta"}"
[[ "$DOTA2_PATH" == [[:alpha:]]:[/\\]* ]] && DOTA2_PATH="$(wslpath -u "$DOTA2_PATH")"
DOTA2_BIN_PATH="$DOTA2_PATH/game/bin/win64/dota2.exe"
DOTA2_TOOLS_BIN_PATH="$DOTA2_PATH/game/bin/win64/dota2cfg.exe"
RSRCC_BIN_PATH="$DOTA2_PATH/game/bin/win64/resourcecompiler.exe"

SRC_CONTENT_PATH="$ROOT_PATH/content"
SRC_GAME_PATH="$ROOT_PATH/game"

DOTA2_ADDONS_CONTENT_REL_PATH="content/dota_addons"
DOTA2_ADDONS_GAME_REL_PATH="game/dota_addons"

DOTA2_ADDONS_GAME_PATH="$DOTA2_PATH/$DOTA2_ADDONS_GAME_REL_PATH"
DOTA2_ADDONS_CONTENT_PATH="$DOTA2_PATH/$DOTA2_ADDONS_CONTENT_REL_PATH"

ADDON_CONTENT_REL_PATH="$DOTA2_ADDONS_CONTENT_REL_PATH/$ADDON"
ADDON_GAME_REL_PATH="$DOTA2_ADDONS_GAME_REL_PATH/$ADDON"

ADDON_CONTENT_PATH="$DOTA2_PATH/$ADDON_CONTENT_REL_PATH"
ADDON_GAME_PATH="$DOTA2_PATH/$ADDON_GAME_REL_PATH"

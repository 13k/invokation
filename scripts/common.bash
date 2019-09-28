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

find_ignore_options() {
  local opts=("(" "(")

  while [[ "$1" ]]; do
    opts=("${opts[@]}" "-path" "$1" "-o")
    shift
  done

  opts=("${opts[@]}" "-false" ")" "-a" "-prune" ")")

  for opt in "${opts[@]}"; do
    echo "$opt"
  done
}

SCRIPT_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
ROOT_PATH="$(dirname "$SCRIPT_DIR")"

if [[ -f "$ROOT_PATH/.env" ]]; then
  source "$ROOT_PATH/.env"
fi

# shellcheck disable=SC2034
VSCRIPTS_PATH="$ROOT_PATH/game/scripts/vscripts"
# shellcheck disable=SC2034
PANORAMA_SCRIPTS_PATH="$ROOT_PATH/content/panorama/scripts"
# shellcheck disable=SC2034
PANORAMA_STYLES_PATH="$ROOT_PATH/content/panorama/styles"

ADDON="invokation"
# shellcheck disable=SC2034
ADDON_MAP="cottage"

# All paths below are unix. Convert using `wslpath`.

DOTA2_PATH="${DOTA2_PATH:-"/mnt/f/SteamLibrary/steamapps/common/dota 2 beta"}"
[[ "$DOTA2_PATH" == [[:alpha:]]:[/\\]* ]] && DOTA2_PATH="$(wslpath -u "$DOTA2_PATH")"
# shellcheck disable=SC2034
DOTA2_BIN_PATH="$DOTA2_PATH/game/bin/win64/dota2.exe"
# shellcheck disable=SC2034
DOTA2_TOOLS_BIN_PATH="$DOTA2_PATH/game/bin/win64/dota2cfg.exe"
# shellcheck disable=SC2034
RSRCC_BIN_PATH="$DOTA2_PATH/game/bin/win64/resourcecompiler.exe"

# shellcheck disable=SC2034
SRC_CONTENT_PATH="$ROOT_PATH/content"
# shellcheck disable=SC2034
SRC_GAME_PATH="$ROOT_PATH/game"

DOTA2_ADDONS_CONTENT_REL_PATH="content/dota_addons"
DOTA2_ADDONS_GAME_REL_PATH="game/dota_addons"

# shellcheck disable=SC2034
DOTA2_ADDONS_GAME_PATH="$DOTA2_PATH/$DOTA2_ADDONS_GAME_REL_PATH"
# shellcheck disable=SC2034
DOTA2_ADDONS_CONTENT_PATH="$DOTA2_PATH/$DOTA2_ADDONS_CONTENT_REL_PATH"

ADDON_CONTENT_REL_PATH="$DOTA2_ADDONS_CONTENT_REL_PATH/$ADDON"
ADDON_GAME_REL_PATH="$DOTA2_ADDONS_GAME_REL_PATH/$ADDON"

# shellcheck disable=SC2034
ADDON_CONTENT_PATH="$DOTA2_PATH/$ADDON_CONTENT_REL_PATH"
# shellcheck disable=SC2034
ADDON_GAME_PATH="$DOTA2_PATH/$ADDON_GAME_REL_PATH"

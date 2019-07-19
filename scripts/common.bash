windows_path() {
  echo "$1" | \sed -re 's#^/mnt/([a-z])#\1:#' -e 's#/#\\#g'
}

wsl_path() {
  echo "$1" | \sed -re 's#^([a-zA-Z]):#/mnt/\L\1\E#' -e 's#\\#/#g'
}

mklink() {
  local src="$1" dest="$2" src_t dest_t
  local args=()

  src_t="$(windows_path "$src")" || return $?
  dest_t="$(windows_path "$dest")" || return $?

  [[ -d "$src" ]] && args=("${args[@]}" "/j")

  cmd.exe /c mklink "${args[@]}" "$dest_t" "$src_t"
}

ADDON="invokation"
ADDON_MAP="invokation"
DOTA_PATH="${DOTA_PATH:-"/mnt/f/SteamLibrary/steamapps/common/dota 2 beta"}"
DOTA_PATH="$(wsl_path "$DOTA_PATH")"
DOTA_BIN_PATH="$DOTA_PATH/game/bin/win64/dota2.exe"
TOOLS_BIN_PATH="$DOTA_PATH/game/bin/win64/dota2cfg.exe"
RESOURCE_COMPILER="$DOTA_PATH/game/bin/win64/resourcecompiler.exe"

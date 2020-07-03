project = "Invokation"
description = "Invokation Dota 2 custom game"
title = "Invokation Lua Documentation"

dir = "doc/ldoc"
format = "lunamark"
package = "invokation"
pretty = "lxsh"
readme = "README.md"
style = "doc"
template = "doc"

file = {
  "game/scripts/vscripts/invokation",
  exclude = { "game/scripts/vscripts/invokation/game_mode/commands" },
}

custom_tags = {
  { "abstract", title = "Abstract method" },
}

backtick_references = true
no_lua_ref = true
no_space_before_args = true
not_luadoc = true
sort_modules = true
use_markdown_titles = true
wrap = true

alias("tfield", {
  "field",
  modifiers = { type = "$1" },
})

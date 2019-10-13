project = "Invokation"
description = "Invokation Dota 2 custom game"
title = "Invokation Lua Documentation"
package = "invokation"

file = {
  "game/scripts/vscripts/invokation",
  exclude = { "game/scripts/vscripts/invokation/game_mode/commands" },
}

dir = "doc/ldoc"
format = "discount"
style = "doc"
template = "doc"
pretty = "lxsh"
readme = "README.md"

backtick_references = false
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

custom_tags = { {
  "abstract",
  title = "Abstract method",
} }

--- Package metadata.
--
-- This loosely follows the [Rockspec format][rockspec].
--
-- [rockspec]: https://github.com/luarocks/luarocks/wiki/Rockspec-format
--
-- @module invokation.const.metadata

local M = {}

--- Package name
-- @tfield string package
M.package = "Invokation"

--- Package version
-- @tfield string version
M.version = "0.5.2"

--- Package description
-- @table description
-- @tfield string summary Package summary
-- @tfield string license Package license
-- @tfield string homepage Package homepage
-- @tfield string issues_url Package issues URL
-- @tfield string maintainer Package maintainer
-- @tfield {string,...} labels Package labels
M.description = {
  summary = "Invokation School of Arcane Arts",
  license = "MIT",
  homepage = "https://github.com/13k/invokation",
  issues_url = "https://github.com/13k/invokation/issues",
  maintainer = "Kiyoshi Murata <kbmurata@gmail.com>",
  labels = { "dota2", "dota2-addon", "dota2-custom-game", "invoker", "invoker-trainer" },
}

return M

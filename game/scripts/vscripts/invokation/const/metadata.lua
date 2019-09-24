--- Package metadata.
--
-- This loosely follows the [Rockspec format][rockspec].
--
-- [rockspec]: https://github.com/luarocks/luarocks/wiki/Rockspec-format
--
-- @module invokation.const.metadata

local M = {}

--- Package name
-- @field[type=string] package
M.package = "Invokation"

--- Package version
-- @field[type=string] version
M.version = "0.3.0-beta1"

--- Package description
-- @table description
-- @field[type=string] summary Package summary
-- @field[type=string] license Package license
-- @field[type=string] homepage Package homepage
-- @field[type=string] issues_url Package issues URL
-- @field[type=string] maintainer Package maintainer
-- @field[type=array(string)] labels Package labels
M.description = {
  summary = "Invokation School of Arcane Arts",
  license = "MIT",
  homepage = "https://github.com/13k/invokation",
  issues_url = "https://github.com/13k/invokation/issues",
  maintainer = "Kiyoshi Murata <kbmurata@gmail.com>",
  labels = {"dota2", "dota2-addon", "dota2-custom-game", "invoker", "invoker-trainer"}
}

return M

--- Package metadata.
---
--- This loosely follows the [Rockspec format][rockspec].
---
--- [rockspec]: https://github.com/luarocks/luarocks/wiki/Rockspec-format
--- @class invk.const.metadata
local M = {}

--- Package name
M.package = "Invokation"

--- Package version
M.version = "0.5.4"

--- Package description
M.description = {
  summary = "Invokation School of Arcane Arts",
  license = "MIT",
  homepage = "https://github.com/13k/invokation",
  issues_url = "https://github.com/13k/invokation/issues",
  maintainer = "13k <k@13k.dev>",
  labels = { "dota2", "dota2-addon", "dota2-custom-game", "invoker", "invoker-trainer" },
}

return M

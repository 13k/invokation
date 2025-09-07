--# selene: allow(unused_variable)
local inspect = require("inspect")

local M = {}

--- @param game_mode invk.GameMode
--- @param player CDOTAPlayerController
--- @param ... string
--- @diagnostic disable-next-line: unused
function M.run(game_mode, player, ...)
  print("debug_misc")
end

return M

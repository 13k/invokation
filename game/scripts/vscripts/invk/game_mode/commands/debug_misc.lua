--# selene: allow(unused_variable)

local M = {}

--- @param game_mode invk.GameMode
--- @param player CDOTAPlayerController
--- @param ... string
--- @diagnostic disable-next-line: unused
function M.run(game_mode, player, ...)
  print("debug_misc")

  local combo_hero = require("invk.combo.hero")

  if select("#", ...) > 0 then
    combo_hero.teardown(player, { hard_reset = true })
  else
    combo_hero.level_up(player, { max_level = true })
  end
end

return M

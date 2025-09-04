local M = {}

--- @param game_mode invk.GameMode
--- @param id string
function M.todot(game_mode, id)
  local combo_id = tonumber(id) --[[@as integer?]]

  if not combo_id then
    errorf("Invalid combo id %q", id)
  end

  local combo = game_mode.combos:create(combo_id) --[[@as invk.combo.Combo?]]

  if combo == nil then
    error("Could not find combo")
  end

  print(combo:todot())
end

return M

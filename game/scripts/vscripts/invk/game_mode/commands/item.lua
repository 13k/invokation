local inspect = require("inspect")

local tbl = require("invk.lang.table")

local M = {}

--- @param game_mode invk.GameMode
--- @param query string
function M.query(game_mode, query)
  local items = game_mode.items_kv:search(query)

  if tbl.is_empty(items) then
    print("No items found.")
    return
  end

  for name, kv in pairs(items) do
    local repr = inspect(kv)

    print(F("%s %s", name, repr))
  end
end

return M

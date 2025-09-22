local class = require("middleclass")
local inspect = require("inspect")

local Base = require("invk.game_mode.command.base")
local tbl = require("invk.lang.table")

--- Query items.
---
--- Usage: invk_item_query <query:string>
---
--- @class invk.game_mode.commands.ItemQuery : invk.game_mode.command.Base
--- @field query string
local M = class("invk.game_mode.commands.ItemQuery", Base)

--- @type invk.game_mode.command.Spec
M.SPEC = {
  id = Base.Id.ItemQuery,
  name = "invk_item_query",
  help = "Query items (<query:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

--- @param game invk.GameMode
--- @param player CDOTAPlayerController
--- @param args string[]
function M:initialize(game, player, args)
  Base.initialize(self, M.SPEC, game, player, args)

  self.query = assert(args[1], "argument <query> is required")
end

function M:run()
  self:d(self.spec.id, self.args)

  local items = self.game.items_kv:search(self.query)

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

local class = require("middleclass")

local Base = require("invk.game_mode.command.base")

--- Dumps combo graph in DOT format.
---
--- Usage: invk_combo_graph_dump <combo_id:string>
---
--- @class invk.game_mode.commands.DumpComboGraph : invk.game_mode.command.Base
--- @field combo_id integer
local M = class("invk.game_mode.commands.DumpComboGraph", Base)

--- @type invk.game_mode.command.Spec
M.SPEC = {
  id = Base.Id.ComboGraphDump,
  name = "invk_combo_graph_dump",
  help = "Dumps a combo's finite state machine in DOT format",
  flags = FCVAR_CHEAT,
  dev = true,
}

--- @param game invk.GameMode
--- @param player CDOTAPlayerController
--- @param args string[]
function M:initialize(game, player, args)
  Base.initialize(self, M.SPEC, game, player, args)

  local combo_id_str = assert(args[1], "argument <combo_id> is required")
  local combo_id = tonumber(combo_id_str) --[[@as integer?]]

  if not combo_id then
    errorf("Invalid combo id %q", combo_id_str)
  end

  self.combo_id = combo_id
end

function M:run()
  self:d(self.spec.id, self.args)

  local combo = self.game.combos:create(self.combo_id) --[[@as invk.combo.Combo?]]

  if combo == nil then
    error("Could not find combo with id %q", self.combo_id)
  end

  print(combo:todot())
end

return M

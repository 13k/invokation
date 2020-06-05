--- PlayerStates class.
-- @classmod invokation.combos.PlayerStates

local class = require("pl.class")

local M = class()

--- Constructor.
function M:_init()
  self.states = {}
end

--- Index metamethod.
-- @tparam CDOTAPlayer player Player
-- @treturn table Player state
function M:__index(player)
  local id = player:GetPlayerID()

  if self.states[id] == nil then
    self.states[id] = {}
  end

  return self.states[id]
end

return M
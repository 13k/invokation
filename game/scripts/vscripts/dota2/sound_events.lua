local M = {}

--[[
  (Entity player, string eventName)
]]
function M.EmitOnPlayer(player, name)
  EmitSoundOnClient(name, player)
end

return M

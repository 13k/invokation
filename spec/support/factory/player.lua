local Player = require("invk.dota2.player")

--- @param attributes? support.factory.dota_player.Attributes
--- @return invk.dota2.Player
return function(attributes)
  local F = require("support.factory")

  return Player:new(F.dota_player(attributes))
end

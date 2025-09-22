local Player = require("invk.dota2.player")

--- @class F.player.Attributes : F.dota_player.Attributes

--- @param attributes? F.player.Attributes
--- @return invk.dota2.Player
return function(attributes)
  local F = require("support.factory")

  return Player:new(F.dota_player(attributes))
end

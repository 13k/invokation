local CDOTAPlayerController = require("support.dota2.CDOTAPlayerController")

--- @class (partial) F.dota_player.Attributes : T.dota2.CDOTAPlayerController.Attributes

--- @param attributes? F.dota_player.Attributes
--- @return T.dota2.CDOTAPlayerController
return function(attributes)
  local F = require("support.factory")

  local attrs = attributes or {}

  attrs.player_id = attrs.player_id or 13
  attrs.hero = attrs.hero or F.dota_hero_invoker()

  return CDOTAPlayerController:new(attrs)
end

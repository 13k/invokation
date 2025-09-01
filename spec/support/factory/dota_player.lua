local CDOTAPlayerController = require("support.dota2.CDOTAPlayerController")

--- @class support.factory.dota_player.Attributes : support.dota2.CDOTAPlayerController_attributes
--- @field hero? support.dota2.CDOTA_BaseNPC_Hero

--- @param attributes? support.factory.dota_player.Attributes
--- @return support.dota2.CDOTAPlayerController
return function(attributes)
  local F = require("support.factory")

  local attrs = attributes or {}

  attrs.player_id = attrs.player_id or 13
  attrs.hero = attrs.hero or F.dota_hero_invoker()

  return CDOTAPlayerController(attrs)
end

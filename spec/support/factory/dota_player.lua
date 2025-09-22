local CDOTAPlayerController = require("support.dota2.CDOTAPlayerController")

--- @class F.dota_player.Attributes : T.dota2.CDOTAPlayerController.Attributes
--- @field hero? T.dota2.CDOTA_BaseNPC_Hero

--- @param attributes? F.dota_player.Attributes
--- @return T.dota2.CDOTAPlayerController
return function(attributes)
  local F = require("support.factory")

  local attrs = attributes or {}

  attrs.player_id = attrs.player_id or 13
  attrs.hero = attrs.hero or F.dota_hero_invoker()

  return CDOTAPlayerController(attrs)
end

--- Sound events helpers.
--- @class invk.dota2.sound_events
local M = {}

--- Play named sound for all players.
--- @param event string
function M.emit_global(event)
  EmitGlobalSound(event)
end

--- Play named sound only on the client for the passed in player.
--- @param event string
--- @param player CDOTAPlayerController
function M.emit_on_player(event, player)
  EmitSoundOnClient(event, player)
end

--- Play named sound on entity.
--- @param event string
--- @param entity CBaseEntity
function M.emit_on_entity(event, entity)
  EmitSoundOn(event, entity)
end

--- Emit a sound on a location from a unit.
--- @param event string
--- @param entity CBaseEntity
--- @param location Vector
function M.emit_on_location_with_caster(event, entity, location)
  EmitSoundOnLocationWithCaster(location, event, entity)
end

--- Emit a sound on a location from a unit, only for players allied with that unit.
--- @param event string
--- @param entity CBaseEntity
--- @param location Vector
function M.emit_on_location_for_allies(event, entity, location)
  EmitSoundOnLocationForAllies(location, event, entity)
end

--- Emit an announcer sound for all players.
--- @param event string
function M.emit_announcer(event)
  EmitAnnouncerSound(event)
end

--- Emit an announcer sound for a player.
--- @param event string
--- @param player CDOTAPlayerController
function M.emit_announcer_for_player(event, player)
  EmitAnnouncerSoundForPlayer(event, player:GetPlayerID())
end

--- Emit an announcer sound for a team.
--- @param event string
--- @param team DOTATeam_t
function M.emit_announcer_for_team(event, team)
  EmitAnnouncerSoundForTeam(event, team)
end

--- Emit an announcer sound for a team at a specific location.
--- @param event string
--- @param team DOTATeam_t
--- @param location Vector
function M.emit_announcer_on_location_for_team(event, team, location)
  EmitAnnouncerSoundForTeamOnLocation(event, team, location)
end

return M

--- Sound events helpers.
-- @module invokation.dota2.sound_events

local tablex = require("pl.tablex")

local EVENTS = require("invokation.const.sound_events")

local M = {}

tablex.update(M, EVENTS)

--- Play named sound for all players.
-- @tparam string event
function M.EmitGlobal(event)
  return EmitGlobalSound(event)
end

--- Play named sound only on the client for the passed in player.
-- @tparam string event
-- @tparam CDOTAPlayer player
function M.EmitOnPlayer(event, player)
  return EmitSoundOnClient(event, player)
end

--- Play named sound on entity.
-- @tparam string event
-- @tparam CBaseEntity entity
function M.EmitOnEntity(event, entity)
  return EmitSoundOn(event, entity)
end

--- Emit a sound on a location from a unit.
-- @tparam string event
-- @tparam CBaseEntity entity
-- @tparam Vector location
function M.EmitOnLocationWithCaster(event, entity, location)
  return EmitSoundOnLocationWithCaster(location, event, entity)
end

--- Emit a sound on a location from a unit, only for players allied with that unit.
-- @tparam string event
-- @tparam CBaseEntity entity
-- @tparam Vector location
function M.EmitOnLocationForAllies(event, entity, location)
  return EmitSoundOnLocationForAllies(location, event, entity)
end

--- Emit an announcer sound for all players.
-- @tparam string event
function M.EmitAnnouncer(event)
  return EmitAnnouncerSound(event)
end

--- Emit an announcer sound for a player.
-- @tparam string event
-- @tparam CDOTAPlayer player
function M.EmitAnnouncerForPlayer(event, player)
  return EmitAnnouncerSoundForPlayer(event, player:GetPlayerID())
end

--- Emit an announcer sound for a team.
-- @tparam string event
-- @tparam int team
function M.EmitAnnouncerForTeam(event, team)
  return EmitAnnouncerSoundForTeam(event, team)
end

--- Emit an announcer sound for a team at a specific location.
-- @tparam string event
-- @tparam int team
-- @tparam Vector location
function M.EmitAnnouncerOnLocationForTeam(event, team, location)
  return EmitAnnouncerSoundForTeamOnLocation(event, team, location)
end

return M
--- Internal combos sound helpers.
-- @module invokation.combos.sound
local SoundEvents = require("invokation.dota2.sound_events")

local M = {}

local MUSIC = {
  IDLE = { STATUS = DOTA_MUSIC_STATUS_PRE_GAME_EXPLORATION, INTENSITY = 1.0 },
  BATTLE = { STATUS = DOTA_MUSIC_STATUS_BATTLE, INTENSITY = 5.0 },
  VICTORY = { STATUS = DOTA_MUSIC_STATUS_EXPLORATION, INTENSITY = 10.0 },
  DEFEAT = { STATUS = DOTA_MUSIC_STATUS_DEAD, INTENSITY = 10.0 },
}

local function randomSoundEvent(events)
  return events[RandomInt(1, #events)]
end

--- Emits a random event on entity.
-- @tparam CBaseEntity entity
-- @tparam {string,...} events Array of event names from which to get a random sample
function M.emitRandomEventOnEntity(entity, events)
  return SoundEvents.EmitOnEntity(randomSoundEvent(events), entity)
end

--- Emits a random event on player.
-- @tparam CDOTAPlayer player
-- @tparam {string,...} events Array of event names from which to get a random sample
function M.emitRandomEventOnPlayer(player, events)
  return SoundEvents.EmitOnPlayer(randomSoundEvent(events), player)
end

--- Sets up sound for when a dummy target unit is created.
-- @tparam dota2.DummyTarget dummy
function M.onDummyCreate(dummy)
  M.emitRandomEventOnEntity(dummy.entity, SoundEvents.SNDEVTS_DUMMY_CREATE)
end

--- Sets up sound for when a player starts a combo.
-- @tparam CDOTAPlayer player
function M.onComboStart(player)
  player:SetMusicStatus(MUSIC.BATTLE.STATUS, MUSIC.BATTLE.INTENSITY)
end

--- Sets up sound for when a player stops a combo.
-- @tparam CDOTAPlayer player
function M.onComboStop(player)
  player:SetMusicStatus(MUSIC.IDLE.STATUS, MUSIC.IDLE.INTENSITY)
end

--- Sets up sound for when a player commits an error in a combo.
-- @tparam CDOTAPlayer player
function M.onComboStepError(player)
  player:SetMusicStatus(MUSIC.DEFEAT.STATUS, MUSIC.DEFEAT.INTENSITY)
end

--- Sets up sound for when a player finishes a combo.
-- @tparam CDOTAPlayer player
function M.onComboFinished(player)
  player:SetMusicStatus(MUSIC.VICTORY.STATUS, MUSIC.VICTORY.INTENSITY)
end

return M

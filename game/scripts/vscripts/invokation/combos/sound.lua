--- Internal combos sound helpers.
-- @module invokation.combos.sound

local SoundEvents = require("invokation.dota2.sound_events")

local M = {}

local MUSIC = {
  IDLE = {
    STATUS = DOTA_MUSIC_STATUS_PRE_GAME_EXPLORATION,
    INTENSITY = 1.0,
  },
  BATTLE = {
    STATUS = DOTA_MUSIC_STATUS_BATTLE,
    INTENSITY = 5.0,
  },
  VICTORY = {
    STATUS = DOTA_MUSIC_STATUS_EXPLORATION,
    INTENSITY = 10.0,
  },
  DEFEAT = {
    STATUS = DOTA_MUSIC_STATUS_DEAD,
    INTENSITY = 10.0,
  },
}

local function randomSoundEvent(events)
  return events[RandomInt(1, #events)]
end

function M.emitRandomEventOnEntity(entity, events)
  return SoundEvents.EmitOnEntity(randomSoundEvent(events), entity)
end

function M.emitRandomEventOnPlayer(player, events)
  return SoundEvents.EmitOnPlayer(randomSoundEvent(events), player)
end

function M.onDummyCreate(dummy)
  M.emitRandomEventOnEntity(dummy.entity, SoundEvents.SNDEVTS_DUMMY_CREATE)
end

function M.onComboStart(player)
  player:SetMusicStatus(MUSIC.BATTLE.STATUS, MUSIC.BATTLE.INTENSITY)
end

function M.onComboStop(player)
  player:SetMusicStatus(MUSIC.IDLE.STATUS, MUSIC.IDLE.INTENSITY)
end

function M.onComboStepError(player)
  player:SetMusicStatus(MUSIC.DEFEAT.STATUS, MUSIC.DEFEAT.INTENSITY)
end

function M.onComboFinished(player)
  player:SetMusicStatus(MUSIC.VICTORY.STATUS, MUSIC.VICTORY.INTENSITY)
end

return M
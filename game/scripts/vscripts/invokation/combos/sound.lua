--- Internal combos sound helpers.
-- @module invokation.combos.sound

local M = {}

local SoundEvents = require("invokation.dota2.sound_events")

local SOUND_EVENTS = {
  dummy_create = {
    "Hero_ShadowShaman.Hex.Target"
  },
  combo_start = {
    "invoker_invo_begin_01",
    "invoker_invo_move_08",
    "invoker_invo_move_09",
    "invoker_invo_move_13",
    "invoker_invo_attack_05",
    "invoker_invo_ability_invoke_01",
  },
  combo_stop = {
    "invoker_invo_failure_04",
  }
}

local MUSIC = {
  IDLE = {
    STATUS = DOTA_MUSIC_STATUS_PRE_GAME_EXPLORATION,
    INTENSITY = 1.0,
  },
  BATTLE = {
    STATUS = DOTA_MUSIC_STATUS_BATTLE,
    INTENSITY = 1.0,
  },
  VICTORY = {
    STATUS = DOTA_MUSIC_STATUS_EXPLORATION,
    INTENSITY = 1.0,
  },
}

local function randomSoundEvent(stage)
  local events = SOUND_EVENTS[stage]
  return events[RandomInt(1, #events)]
end

function M.emitRandomEventOnEntity(entity, group)
  return SoundEvents.EmitOnEntity(randomSoundEvent(group), entity)
end

function M.emitRandomEventOnPlayer(player, group)
  return SoundEvents.EmitOnPlayer(randomSoundEvent(group), player)
end

function M.onDummyCreate(dummy)
  M.emitRandomEventOnEntity(dummy.entity, "dummy_create")
end

function M.onComboStart(player)
  player:SetMusicStatus(MUSIC.BATTLE.STATUS, MUSIC.BATTLE.INTENSITY)
  M.emitRandomEventOnPlayer(player, "combo_start")
end

function M.onComboStop(player)
  player:SetMusicStatus(MUSIC.IDLE.STATUS, MUSIC.IDLE.INTENSITY)
  M.emitRandomEventOnPlayer(player, "combo_stop")
end

function M.onComboFinished(player)
  player:SetMusicStatus(MUSIC.VICTORY.STATUS, MUSIC.VICTORY.INTENSITY)
end

return M

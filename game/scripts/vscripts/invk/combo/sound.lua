local SOUND_EVENTS = require("invk.const.sound_events")
local SoundEvents = require("invk.dota2.sound_events")

--- Internal combos sound helpers.
--- @class invk.combos.sound
local M = {}

local MUSIC = {
  IDLE = { STATUS = DOTA_MUSIC_STATUS_PRE_GAME_EXPLORATION, INTENSITY = 1.0 },
  BATTLE = { STATUS = DOTA_MUSIC_STATUS_BATTLE, INTENSITY = 5.0 },
  VICTORY = { STATUS = DOTA_MUSIC_STATUS_EXPLORATION, INTENSITY = 10.0 },
  DEFEAT = { STATUS = DOTA_MUSIC_STATUS_DEAD, INTENSITY = 10.0 },
}

--- @param events string[] # Array of event names from which to get a random sample
--- @return string
local function random_sound_event(events)
  local event = assert(events[RandomInt(1, #events)], "RandomInt() returned invalid value")

  return event
end

--- Emits a random event on entity.
--- @param entity CBaseEntity # Entity
--- @param events string[] # Array of event names from which to get a random sample
function M.emit_random_event_on_entity(entity, events)
  SoundEvents.emit_on_entity(random_sound_event(events), entity)
end

--- Emits a random event on player.
--- @param player CDOTAPlayerController # Player
--- @param events string[] # Array of event names from which to get a random sample
function M.emit_random_event_on_player(player, events)
  SoundEvents.emit_on_player(random_sound_event(events), player)
end

--- Sets up sound for when a dummy target unit is created.
--- @param dummy invk.dota2.DummyTarget
function M.on_dummy_create(dummy)
  M.emit_random_event_on_entity(
    dummy.entity --[[@as CBaseEntity]],
    SOUND_EVENTS.SNDEVTS_DUMMY_CREATE
  )
end

--- Sets up sound for when a player starts a combo.
--- @param player CDOTAPlayerController
function M.on_combo_start(player)
  player:SetMusicStatus(MUSIC.BATTLE.STATUS, MUSIC.BATTLE.INTENSITY)
end

--- Sets up sound for when a player stops a combo.
--- @param player CDOTAPlayerController
function M.on_combo_stop(player)
  player:SetMusicStatus(MUSIC.IDLE.STATUS, MUSIC.IDLE.INTENSITY)
end

--- Sets up sound for when a player commits an error in a combo.
--- @param player CDOTAPlayerController
function M.on_combo_step_error(player)
  player:SetMusicStatus(MUSIC.DEFEAT.STATUS, MUSIC.DEFEAT.INTENSITY)
end

--- Sets up sound for when a player finishes a combo.
--- @param player CDOTAPlayerController
function M.on_combo_finished(player)
  player:SetMusicStatus(MUSIC.VICTORY.STATUS, MUSIC.VICTORY.INTENSITY)
end

return M

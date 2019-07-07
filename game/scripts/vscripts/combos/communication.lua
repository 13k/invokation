local M = {}

local SoundEvents = require("dota2.sound_events")
local CustomEvents = require("dota2.custom_events")

local SOUND_EVENTS = {
  combo_start = 6,
  combo_stop = 1,
  combo_error = 1,
}

local function randomSoundEvent(stage)
  local max = SOUND_EVENTS[stage]
  return stage .. "_" .. tostring(RandomInt(1, max))
end

function M.emitSound(player, stage)
  return SoundEvents.EmitOnPlayer(player, randomSoundEvent(stage))
end

function M.sendPickerShow()
  return CustomEvents.SendAll(CustomEvents.EVENT_PICKER_SHOW)
end

function M.sendAbilityUsed(player, ability)
  local payload = {ability = ability.name}
  return CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBAT_LOG_ABILITY_USED, payload)
end

function M.sendStarted(player, combo)
  local payload = {combo = combo.name, next = combo:NextSteps()}
  return CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBO_STARTED, payload)
end

function M.sendStopped(player)
  return CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBO_STOPPED)
end

function M.sendProgress(player, combo)
  local payload = {combo = combo.name, next = combo:NextSteps()}
  return CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBO_PROGRESS, payload)
end

function M.sendStepError(player, combo, ability)
  local payload = {combo = combo.name, expected = combo:NextSteps(), ability = ability.name}
  return CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBO_STEP_ERROR, payload)
end

function M.sendFinished(player, combo)
  local payload = {combo = combo.name}
  return CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBO_FINISHED, payload)
end

return M

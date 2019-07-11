local M = {}

local SoundEvents = require("dota2.sound_events")
local CustomEvents = require("dota2.custom_events")

function M.emitSound(player, sndEvent)
  return SoundEvents.EmitOnPlayer(player, sndEvent)
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
  local payload = {combo = combo.name, next = combo:NextSteps(), count = combo.count}
  return CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBO_PROGRESS, payload)
end

function M.sendStepError(player, combo, ability)
  local payload = {combo = combo.name, expected = combo:NextSteps(), ability = ability.name}
  return CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBO_STEP_ERROR, payload)
end

function M.sendFinished(player, combo, playerState)
  local payload = {combo = combo.name, count = combo.count, damage = playerState.damage}
  return CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBO_FINISHED, payload)
end

return M

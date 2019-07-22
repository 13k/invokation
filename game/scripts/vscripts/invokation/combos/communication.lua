--- Internal combos communication helpers.
-- @module invokation.combos.communication

local M = {}

local CustomEvents = require("invokation.dota2.custom_events")

function M.sendAbilityUsed(player, ability)
  local payload = {ability = ability.name}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBAT_LOG_ABILITY_USED, player, payload)
end

function M.sendStarted(player, combo)
  local payload = {combo = combo.id, next = combo:NextSteps()}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_STARTED, player, payload)
end

function M.sendStopped(player)
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_STOPPED, player)
end

function M.sendProgress(player, combo)
  local payload = {combo = combo.id, next = combo:NextSteps(), count = combo.count}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_PROGRESS, player, payload)
end

function M.sendStepError(player, combo, ability)
  local payload = {combo = combo.id, expected = combo:NextSteps(), ability = ability.name}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_STEP_ERROR, player, payload)
end

function M.sendFinished(player, combo, playerState)
  local payload = {combo = combo.id, count = combo.count, damage = playerState.damage}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_FINISHED, player, payload)
end

return M

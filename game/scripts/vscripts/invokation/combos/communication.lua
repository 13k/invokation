--- Internal combos communication helpers.
-- @module invokation.combos.communication

local M = {}

local CustomEvents = require("invokation.dota2.custom_events")

local function comboMetrics(combo)
  return {
    count = combo.count,
    damage = combo.damage,
    duration = combo.duration
  }
end

function M.sendAbilityUsed(player, ability)
  local payload = {ability = ability.name}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBAT_LOG_ABILITY_USED, player, payload)
end

function M.sendStarted(player, combo)
  local payload = {combo = combo.id, next = combo:NextSteps()}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_STARTED, player, payload)
end

function M.sendStopped(player, combo)
  local payload = {combo = combo.id}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_STOPPED, player, payload)
end

function M.sendInProgress(player, combo)
  local payload = {combo = combo.id}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_IN_PROGRESS, player, payload)
end

function M.sendProgress(player, combo)
  local payload = {combo = combo.id, metrics = comboMetrics(combo), next = combo:NextSteps()}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_PROGRESS, player, payload)
end

function M.sendStepError(player, combo, ability)
  local payload = {combo = combo.id, expected = combo:NextSteps(), ability = ability.name}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_STEP_ERROR, player, payload)
end

function M.sendPreFinish(player, combo)
  local payload = {combo = combo.id, metrics = comboMetrics(combo), wait = combo.waitDuration}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_PRE_FINISH, player, payload)
end

function M.sendFinished(player, combo)
  local payload = {combo = combo.id, metrics = comboMetrics(combo)}
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_FINISHED, player, payload)
end

return M

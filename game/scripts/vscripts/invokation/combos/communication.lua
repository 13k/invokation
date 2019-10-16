--- Internal combos communication helpers.
-- @module invokation.combos.communication

local CustomEvents = require("invokation.dota2.custom_events")

local M = {}

local function comboMetrics(combo)
  return {
    count = combo.count,
    damage = combo.damage,
    duration = combo.duration,
  }
end

--- Sends a custom event notifying that an ability was used.
-- @tparam CDOTAPlayer player Player to send the event to
-- @tparam dota2.Ability ability Ability
function M.sendAbilityUsed(player, ability)
  local payload = { ability = ability.name }
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBAT_LOG_ABILITY_USED, player, payload)
end

--- Sends a custom event notifying that a combo started.
-- @tparam CDOTAPlayer player Player to send the event to
-- @tparam Combo combo Combo
function M.sendStarted(player, combo)
  local payload = {
    id = combo.id,
    next = combo:NextStepsIds(),
  }

  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_STARTED, player, payload)
end

--- Sends a custom event notifying that a combo stopped.
-- @tparam CDOTAPlayer player Player to send the event to
-- @tparam Combo combo Combo
function M.sendStopped(player, combo)
  local payload = { id = combo.id }
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_STOPPED, player, payload)
end

--- Sends a custom event notifying that a combo is in progress.
-- @tparam CDOTAPlayer player Player to send the event to
-- @tparam Combo combo Combo
function M.sendInProgress(player, combo)
  local payload = { id = combo.id }
  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_IN_PROGRESS, player, payload)
end

--- Sends a custom event notifying that a combo progressed.
-- @tparam CDOTAPlayer player Player to send the event to
-- @tparam Combo combo Combo
function M.sendProgress(player, combo)
  local payload = {
    id = combo.id,
    metrics = comboMetrics(combo),
    next = combo:NextStepsIds(),
  }

  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_PROGRESS, player, payload)
end

--- Sends a custom event notifying about a combo step error.
-- @tparam CDOTAPlayer player Player to send the event to
-- @tparam Combo combo Combo
-- @tparam dota2.Ability ability Ability used that caused the error
function M.sendStepError(player, combo, ability)
  local payload = {
    id = combo.id,
    expected = combo:NextStepsIds(),
    ability = ability.name,
  }

  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_STEP_ERROR, player, payload)
end

--- Sends a custom event notifying that a combo entered pre-finish state.
-- @tparam CDOTAPlayer player Player to send the event to
-- @tparam Combo combo Combo
function M.sendPreFinish(player, combo)
  local payload = {
    id = combo.id,
    metrics = comboMetrics(combo),
    wait = combo.waitDuration,
  }

  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_PRE_FINISH, player, payload)
end

--- Sends a custom event notifying that a combo finished.
-- @tparam CDOTAPlayer player Player to send the event to
-- @tparam Combo combo Combo
function M.sendFinished(player, combo)
  local payload = {
    id = combo.id,
    metrics = comboMetrics(combo),
  }

  return CustomEvents.SendPlayer(CustomEvents.EVENT_COMBO_FINISHED, player, payload)
end

return M

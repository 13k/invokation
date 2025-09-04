local CUSTOM_EVENTS = require("invk.const.custom_events")
local CustomEvents = require("invk.dota2.custom_events")

--- Internal combos communication helpers.
--- @class invk.combos.communication
local M = {}

--- Sends a custom event notifying that an ability was used.
--- @param player CDOTAPlayerController # Player to send the event to
--- @param ability invk.dota2.Ability # Ability
function M.send_ability_used(player, ability)
  --- @type invk.custom_events.CombatLogAbilityUsedPayload
  local payload = {
    ability = ability.name,
  }

  return CustomEvents.send_player(CUSTOM_EVENTS.EVENT_COMBAT_LOG_ABILITY_USED, player, payload)
end

--- Sends a custom event notifying that a combo started.
--- @param player CDOTAPlayerController # Player to send the event to
--- @param combo invk.combo.BaseCombo # Combo
function M.send_started(player, combo)
  --- @type invk.custom_events.ComboStartedPayload
  local payload = {
    id = combo.id,
    next = combo:next_steps_ids(),
  }

  return CustomEvents.send_player(CUSTOM_EVENTS.EVENT_COMBO_STARTED, player, payload)
end

--- Sends a custom event notifying that a combo stopped.
--- @param player CDOTAPlayerController # Player to send the event to
--- @param combo invk.combo.BaseCombo # Combo
function M.send_stopped(player, combo)
  --- @type invk.custom_events.ComboStoppedPayload
  local payload = {
    id = combo.id,
  }

  return CustomEvents.send_player(CUSTOM_EVENTS.EVENT_COMBO_STOPPED, player, payload)
end

--- Sends a custom event notifying that a combo is in progress.
--- @param player CDOTAPlayerController # Player to send the event to
--- @param combo invk.combo.BaseCombo # Combo
function M.send_in_progress(player, combo)
  --- @type invk.custom_events.ComboInProgressPayload
  local payload = {
    id = combo.id,
  }

  return CustomEvents.send_player(CUSTOM_EVENTS.EVENT_COMBO_IN_PROGRESS, player, payload)
end

--- Sends a custom event notifying that a combo progressed.
--- @param player CDOTAPlayerController # Player to send the event to
--- @param combo invk.combo.BaseCombo # Combo
function M.send_progress(player, combo)
  --- @type invk.custom_events.ComboProgressPayload
  local payload = {
    id = combo.id,
    metrics = combo.metrics,
    next = combo:next_steps_ids(),
  }

  return CustomEvents.send_player(CUSTOM_EVENTS.EVENT_COMBO_PROGRESS, player, payload)
end

--- Sends a custom event notifying about a combo step error.
--- @param player CDOTAPlayerController # Player to send the event to
--- @param combo invk.combo.Combo # Combo
--- @param ability invk.dota2.Ability # Ability used that caused the error
function M.send_step_error(player, combo, ability)
  --- @type invk.custom_events.ComboStepErrorPayload
  local payload = {
    id = combo.id,
    expected = combo:next_steps_ids(),
    ability = ability.name,
  }

  return CustomEvents.send_player(CUSTOM_EVENTS.EVENT_COMBO_STEP_ERROR, player, payload)
end

--- Sends a custom event notifying that a combo entered pre-finish state.
--- @param player CDOTAPlayerController # Player to send the event to
--- @param combo invk.combo.Combo # Combo
function M.send_pre_finish(player, combo)
  --- @type invk.custom_events.ComboPreFinishPayload
  local payload = {
    id = combo.id,
    metrics = combo.metrics,
    wait = combo.wait.duration,
  }

  return CustomEvents.send_player(CUSTOM_EVENTS.EVENT_COMBO_PRE_FINISH, player, payload)
end

--- Sends a custom event notifying that a combo finished.
--- @param player CDOTAPlayerController # Player to send the event to
--- @param combo invk.combo.Combo # Combo
function M.send_finished(player, combo)
  --- @type invk.custom_events.ComboFinishedPayload
  local payload = {
    id = combo.id,
    metrics = combo.metrics,
  }

  return CustomEvents.send_player(CUSTOM_EVENTS.EVENT_COMBO_FINISHED, player, payload)
end

return M

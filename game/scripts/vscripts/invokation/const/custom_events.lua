--- Custom event names.
-- @module invokation.const.custom_events

local M = {}

--- Combos
-- @section combos

--- reload combos
M.EVENT_COMBOS_RELOAD = "invokation_combos_reload"
--- start combo
M.EVENT_COMBO_START = "invokation_combo_start"
--- combo started
M.EVENT_COMBO_STARTED = "invokation_combo_started"
--- stop combo
M.EVENT_COMBO_STOP = "invokation_combo_stop"
--- combo stopped
M.EVENT_COMBO_STOPPED = "invokation_combo_stopped"
--- restart combo
M.EVENT_COMBO_RESTART = "invokation_combo_restart"
--- combo progress
M.EVENT_COMBO_PROGRESS = "invokation_combo_progress"
--- combo step error
M.EVENT_COMBO_STEP_ERROR = "invokation_combo_step_error"
--- combo finished
M.EVENT_COMBO_FINISHED = "invokation_combo_finished"

--- Combat Log
-- @section combat_log

--- start capturing combat log
M.EVENT_COMBAT_LOG_CAPTURE_START = "invokation_combat_log_capture_start"
--- stop capturing combat log
M.EVENT_COMBAT_LOG_CAPTURE_STOP = "invokation_combat_log_capture_stop"
--- combat log ability used
M.EVENT_COMBAT_LOG_ABILITY_USED = "invokation_combat_log_ability_used"
--- clear combat log
M.EVENT_COMBAT_LOG_CLEAR = "invokation_combat_log_clear"

return M

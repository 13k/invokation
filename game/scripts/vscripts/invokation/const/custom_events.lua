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
--- combo in progress
M.EVENT_COMBO_IN_PROGRESS = "invokation_combo_in_progress"
--- combo progress
M.EVENT_COMBO_PROGRESS = "invokation_combo_progress"
--- combo step error
M.EVENT_COMBO_STEP_ERROR = "invokation_combo_step_error"
--- combo pre finish
M.EVENT_COMBO_PRE_FINISH = "invokation_combo_pre_finish"
--- combo finished
M.EVENT_COMBO_FINISHED = "invokation_combo_finished"
--- restart combo
M.EVENT_COMBO_RESTART = "invokation_combo_restart"

--- Freestyle
-- @section freestyle

--- hero level up
M.EVENT_FREESTYLE_HERO_LEVEL_UP = "invokation_freestyle_hero_level_up"

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

--- Item Picker
-- @section item_picker

--- item picker query
M.EVENT_ITEM_PICKER_QUERY = "invokation_item_picker_query"
--- item picker query response
M.EVENT_ITEM_PICKER_QUERY_RESPONSE = "invokation_item_picker_query_response"

return M
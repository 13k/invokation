--- Custom event names.
-- @module invokation.const.custom_events
local M = {}

--- Combos
-- @section combos

--- @{EVENT_COMBOS_RELOAD} payload
-- @table CombosReloadPayload

--- Reload combos
M.EVENT_COMBOS_RELOAD = "invokation_combos_reload"

--- @{EVENT_COMBO_START} payload
-- @table ComboStartPayload
-- @tfield int id Combo id

--- Start combo
M.EVENT_COMBO_START = "invokation_combo_start"

--- @{EVENT_COMBO_STARTED} payload
-- @table ComboStartedPayload
-- @tfield int id Combo id
-- @tfield[opt] {int,...} next Next steps ids

--- Combo started
M.EVENT_COMBO_STARTED = "invokation_combo_started"

--- @{EVENT_COMBO_STOP} payload
-- @table ComboStopPayload

--- Stop combo
M.EVENT_COMBO_STOP = "invokation_combo_stop"

--- @{EVENT_COMBO_STOPPED} payload
-- @table ComboStoppedPayload
-- @tfield int id Combo id

--- Combo stopped
M.EVENT_COMBO_STOPPED = "invokation_combo_stopped"

--- @{EVENT_COMBO_IN_PROGRESS} payload
-- @table ComboInProgressPayload
-- @tfield int id Combo id

--- Combo in progress
M.EVENT_COMBO_IN_PROGRESS = "invokation_combo_in_progress"

--- @{EVENT_COMBO_PROGRESS} payload
-- @table ComboProgressPayload
-- @tfield int id Combo id
-- @tfield {[string]=number} metrics Combo metrics
-- @tfield[opt] {int,...} next Next steps ids

--- Combo progress
M.EVENT_COMBO_PROGRESS = "invokation_combo_progress"

--- @{EVENT_COMBO_STEP_ERROR} payload
-- @table ComboStepErrorPayload
-- @tfield int id Combo id
-- @tfield {int,...} expected Expected steps ids
-- @tfield string ability Ability name

--- Combo step error
M.EVENT_COMBO_STEP_ERROR = "invokation_combo_step_error"

--- @{EVENT_COMBO_PRE_FINISH} payload
-- @table ComboPreFinishPayload
-- @tfield int id Combo id
-- @tfield {[string]=number} metrics Combo metrics
-- @tfield int wait Time to wait before combo finishes

--- Combo pre finish
M.EVENT_COMBO_PRE_FINISH = "invokation_combo_pre_finish"

--- @{EVENT_COMBO_FINISHED} payload
-- @table ComboFinishedPayload
-- @tfield int id Combo id
-- @tfield {[string]=number} metrics Combo metrics

--- Combo finished
M.EVENT_COMBO_FINISHED = "invokation_combo_finished"

--- @{EVENT_COMBO_RESTART} payload
-- @table ComboRestartPayload
-- @tfield[opt=0] int hardReset Perform hard reset (`1`: yes, `0`: no)

--- Restart combo
M.EVENT_COMBO_RESTART = "invokation_combo_restart"

--- Freestyle
-- @section freestyle

--- @{EVENT_FREESTYLE_HERO_LEVEL_UP} payload
-- @table FreestyleHeroLevelUpPayload
-- @tfield[opt] int level Level up to specified level
-- @tfield[opt=0] int maxLevel Level up to max level (`1`: yes, `0`: no)

--- Freestyle hero level up
M.EVENT_FREESTYLE_HERO_LEVEL_UP = "invokation_freestyle_hero_level_up"

--- Combat Log
-- @section combat_log

--- @{EVENT_COMBAT_LOG_CAPTURE_START} payload
-- @table CombatLogCaptureStartPayload

--- Start capturing combat log
M.EVENT_COMBAT_LOG_CAPTURE_START = "invokation_combat_log_capture_start"

--- @{EVENT_COMBAT_LOG_CAPTURE_STOP} payload
-- @table CombatLogCaptureStopPayload

--- Stop capturing combat log
M.EVENT_COMBAT_LOG_CAPTURE_STOP = "invokation_combat_log_capture_stop"

--- @{EVENT_COMBAT_LOG_ABILITY_USED} payload
-- @table CombatLogAbilityUsedPayload

--- Combat log ability used
M.EVENT_COMBAT_LOG_ABILITY_USED = "invokation_combat_log_ability_used"

--- @{EVENT_COMBAT_LOG_CLEAR} payload
-- @table CombatLogClearPayload

--- Clear combat log
M.EVENT_COMBAT_LOG_CLEAR = "invokation_combat_log_clear"

--- Item Picker
-- @section item_picker

--- @{EVENT_ITEM_PICKER_QUERY} payload
-- @table ItemPickerQueryPayload
-- @tfield string query Query

--- Item picker query
M.EVENT_ITEM_PICKER_QUERY = "invokation_item_picker_query"

--- @{EVENT_ITEM_PICKER_QUERY_RESPONSE} payload
-- @table ItemPickerQueryResponsePayload
-- @tfield {[string]=table,...} items Items found

--- Item picker query response
M.EVENT_ITEM_PICKER_QUERY_RESPONSE = "invokation_item_picker_query_response"

return M

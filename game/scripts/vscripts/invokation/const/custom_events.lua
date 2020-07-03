--- Custom event names.
-- @module invokation.const.custom_events
local M = {}

--- Combos
-- @section combos

--- Payload for event `EVENT_COMBOS_RELOAD`
-- @table CombosReloadPayload

--- Reload combos
M.EVENT_COMBOS_RELOAD = "invokation_combos_reload"

--- Payload for event `EVENT_COMBO_START`
-- @table ComboStartPayload
-- @tfield int id Combo id

--- Start combo
M.EVENT_COMBO_START = "invokation_combo_start"

--- Payload for event `EVENT_COMBO_STARTED`
-- @table ComboStartedPayload
-- @tfield int id Combo id
-- @tfield[opt] {int,...} next Next steps ids

--- Combo started
M.EVENT_COMBO_STARTED = "invokation_combo_started"

--- Payload for event `EVENT_COMBO_STOP`
-- @table ComboStopPayload

--- Stop combo
M.EVENT_COMBO_STOP = "invokation_combo_stop"

--- Payload for event `EVENT_COMBO_STOPPED`
-- @table ComboStoppedPayload
-- @tfield int id Combo id

--- Combo stopped
M.EVENT_COMBO_STOPPED = "invokation_combo_stopped"

--- Payload for event `EVENT_COMBO_IN_PROGRESS`
-- @table ComboInProgressPayload
-- @tfield int id Combo id

--- Combo in progress
M.EVENT_COMBO_IN_PROGRESS = "invokation_combo_in_progress"

--- Payload for event `EVENT_COMBO_PROGRESS`
-- @table ComboProgressPayload
-- @tfield int id Combo id
-- @tfield {[string]=number} metrics Combo metrics
-- @tfield[opt] {int,...} next Next steps ids

--- Combo progress
M.EVENT_COMBO_PROGRESS = "invokation_combo_progress"

--- Payload for event `EVENT_COMBO_STEP_ERROR`
-- @table ComboStepErrorPayload
-- @tfield int id Combo id
-- @tfield {int,...} expected Expected steps ids
-- @tfield string ability Ability name

--- Combo step error
M.EVENT_COMBO_STEP_ERROR = "invokation_combo_step_error"

--- Payload for event `EVENT_COMBO_PRE_FINISH`
-- @table ComboPreFinishPayload
-- @tfield int id Combo id
-- @tfield {[string]=number} metrics Combo metrics
-- @tfield int wait Time to wait before combo finishes

--- Combo pre finish
M.EVENT_COMBO_PRE_FINISH = "invokation_combo_pre_finish"

--- Payload for event `EVENT_COMBO_FINISHED`
-- @table ComboFinishedPayload
-- @tfield int id Combo id
-- @tfield {[string]=number} metrics Combo metrics

--- Combo finished
M.EVENT_COMBO_FINISHED = "invokation_combo_finished"

--- Payload for event `EVENT_COMBO_RESTART`
-- @table ComboRestartPayload
-- @tfield[opt=0] int hardReset Perform hard reset (`1`: yes, `0`: no)

--- Restart combo
M.EVENT_COMBO_RESTART = "invokation_combo_restart"

--- Freestyle
-- @section freestyle

--- Payload for event `EVENT_FREESTYLE_HERO_LEVEL_UP`
-- @table FreestyleHeroLevelUpPayload
-- @tfield[opt] int level Level up to specified level
-- @tfield[opt=0] int maxLevel Level up to max level (`1`: yes, `0`: no)

--- Freestyle hero level up
M.EVENT_FREESTYLE_HERO_LEVEL_UP = "invokation_freestyle_hero_level_up"

--- Combat Log
-- @section combat_log

--- Payload for event `EVENT_COMBAT_LOG_CAPTURE_START`
-- @table CombatLogCaptureStartPayload

--- Start capturing combat log
M.EVENT_COMBAT_LOG_CAPTURE_START = "invokation_combat_log_capture_start"

--- Payload for event `EVENT_COMBAT_LOG_CAPTURE_STOP`
-- @table CombatLogCaptureStopPayload

--- Stop capturing combat log
M.EVENT_COMBAT_LOG_CAPTURE_STOP = "invokation_combat_log_capture_stop"

--- Payload for event `EVENT_COMBAT_LOG_ABILITY_USED`
-- @table CombatLogAbilityUsedPayload

--- Combat log ability used
M.EVENT_COMBAT_LOG_ABILITY_USED = "invokation_combat_log_ability_used"

--- Payload for event `EVENT_COMBAT_LOG_CLEAR`
-- @table CombatLogClearPayload

--- Clear combat log
M.EVENT_COMBAT_LOG_CLEAR = "invokation_combat_log_clear"

--- Item Picker
-- @section item_picker

--- Payload for event `EVENT_ITEM_PICKER_QUERY`
-- @table ItemPickerQueryPayload
-- @tfield string query Query

--- Item picker query
M.EVENT_ITEM_PICKER_QUERY = "invokation_item_picker_query"

--- Payload for event `EVENT_ITEM_PICKER_QUERY_RESPONSE`
-- @table ItemPickerQueryResponsePayload
-- @tfield {[string]=table,...} items Items found

--- Item picker query response
M.EVENT_ITEM_PICKER_QUERY_RESPONSE = "invokation_item_picker_query_response"

return M

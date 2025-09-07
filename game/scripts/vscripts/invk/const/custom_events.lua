--- Custom event names.
--- @class invk.const.custom_events
local M = {}

--- Payload for event `EVENT_PLAYER_HERO_IN_GAME`
--- @class invk.custom_events.PlayerHeroInGame : invk.game_mode.PlayerHero

--- Player picked a hero
M.EVENT_PLAYER_HERO_IN_GAME = "invk_player_hero_in_game"

--- Payload for event `EVENT_PLAYER_HERO_FACET_REQUEST`
--- @class invk.custom_events.PlayerHeroFacetRequest
--- @field variant invk.dota2.invoker.FacetVariant

--- Player selected a hero facet
M.EVENT_PLAYER_HERO_FACET_REQUEST = "invk_player_hero_facet_request"

--- Payload for event `EVENT_PLAYER_HERO_FACET_RESPONSE`
--- @class invk.custom_events.PlayerHeroFacetResponse
--- @field hero? invk.game_mode.PlayerHero
--- @field error? string

--- Response to event `EVENT_PLAYER_HERO_FACET_REQUEST`
M.EVENT_PLAYER_HERO_FACET_RESPONSE = "invk_player_hero_facet_response"

--- Payload for event `EVENT_PLAYER_QUIT_REQUEST`
--- @class invk.custom_events.PlayerQuitRequest

--- Player requested to leave
M.EVENT_PLAYER_QUIT_REQUEST = "invk_player_quit_request"

--- Payload for event `EVENT_COMBOS_RELOAD`
--- @class invk.custom_events.CombosReloadPayload

--- Reload combos
M.EVENT_COMBOS_RELOAD = "invk_combos_reload"

--- Payload for event `EVENT_COMBO_START`
--- @class invk.custom_events.ComboStartPayload
--- @field id invk.combo.ComboId # Combo id

--- Start combo
M.EVENT_COMBO_START = "invk_combo_start"

--- Payload for event `EVENT_COMBO_STARTED`
--- @class invk.custom_events.ComboStartedPayload
--- @field id invk.combo.ComboId # Combo id
--- @field next? integer[] # Next steps ids

--- Combo started
M.EVENT_COMBO_STARTED = "invk_combo_started"

--- Payload for event `EVENT_COMBO_STOP`
--- @class invk.custom_events.ComboStopPayload

--- Stop combo
M.EVENT_COMBO_STOP = "invk_combo_stop"

--- Payload for event `EVENT_COMBO_STOPPED`
--- @class invk.custom_events.ComboStoppedPayload
--- @field id invk.combo.ComboId # Combo id

--- Combo stopped
M.EVENT_COMBO_STOPPED = "invk_combo_stopped"

--- Payload for event `EVENT_COMBO_IN_PROGRESS`
--- @class invk.custom_events.ComboInProgressPayload
--- @field id invk.combo.ComboId # Combo id

--- Combo in progress
M.EVENT_COMBO_IN_PROGRESS = "invk_combo_in_progress"

--- Payload for event `EVENT_COMBO_PROGRESS`
--- @class invk.custom_events.ComboProgressPayload
--- @field id invk.combo.ComboId # Combo id
--- @field metrics invk.combo.Metrics # Combo metrics
--- @field next? integer[] # Next steps ids

--- Combo progress
M.EVENT_COMBO_PROGRESS = "invk_combo_progress"

--- Payload for event `EVENT_COMBO_STEP_ERROR`
--- @class invk.custom_events.ComboStepErrorPayload
--- @field id invk.combo.ComboId # Combo id
--- @field expected integer[] # Expected steps ids
--- @field ability string # Ability name

--- Combo step error
M.EVENT_COMBO_STEP_ERROR = "invk_combo_step_error"

--- Payload for event `EVENT_COMBO_PRE_FINISH`
--- @class invk.custom_events.ComboPreFinishPayload
--- @field id invk.combo.ComboId # Combo id
--- @field metrics invk.combo.Metrics # Combo metrics
--- @field wait number # Time to wait before combo finishes

--- Combo pre finish
M.EVENT_COMBO_PRE_FINISH = "invk_combo_pre_finish"

--- Payload for event `EVENT_COMBO_FINISHED`
--- @class invk.custom_events.ComboFinishedPayload
--- @field id invk.combo.ComboId # Combo id
--- @field metrics invk.combo.Metrics # Combo metrics

--- Combo finished
M.EVENT_COMBO_FINISHED = "invk_combo_finished"

--- Payload for event `EVENT_COMBO_RESTART`
--- @class invk.custom_events.ComboRestartPayload
--- @field hardReset? integer # Perform hard reset (`1`: yes, `0`: no) (default: `0`)

--- Restart combo
M.EVENT_COMBO_RESTART = "invk_combo_restart"

--- Payload for event `EVENT_FREESTYLE_HERO_LEVEL_UP`
--- @class invk.custom_events.FreestyleHeroLevelUpPayload
--- @field level? integer # Level up to specified level
--- @field maxLevel? integer # Level up to max level (`1`: yes, `0`: no) (default: `0`)

--- Freestyle hero level up
M.EVENT_FREESTYLE_HERO_LEVEL_UP = "invk_freestyle_hero_level_up"

--- Payload for event `EVENT_COMBAT_LOG_CAPTURE_START`
--- @class invk.custom_events.CombatLogCaptureStartPayload

--- Start capturing combat log
M.EVENT_COMBAT_LOG_CAPTURE_START = "invk_combat_log_capture_start"

--- Payload for event `EVENT_COMBAT_LOG_CAPTURE_STOP`
--- @class invk.custom_events.CombatLogCaptureStopPayload

--- Stop capturing combat log
M.EVENT_COMBAT_LOG_CAPTURE_STOP = "invk_combat_log_capture_stop"

--- Payload for event `EVENT_COMBAT_LOG_ABILITY_USED`
--- @class invk.custom_events.CombatLogAbilityUsedPayload

--- Combat log ability used
M.EVENT_COMBAT_LOG_ABILITY_USED = "invk_combat_log_ability_used"

--- Payload for event `EVENT_COMBAT_LOG_CLEAR`
--- @class invk.custom_events.CombatLogClearPayload

--- Clear combat log
M.EVENT_COMBAT_LOG_CLEAR = "invk_combat_log_clear"

--- Payload for event `EVENT_ITEM_PICKER_QUERY`
--- @class invk.custom_events.ItemPickerQueryPayload
--- @field query string # Query

--- Item picker query
M.EVENT_ITEM_PICKER_QUERY_REQUEST = "invk_item_picker_query_request"

--- Payload for event `EVENT_ITEM_PICKER_QUERY_RESPONSE`
--- @class invk.custom_events.ItemPickerQueryResponsePayload
--- @field items invk.dota2.KeyValues # Items found

--- Item picker query response
M.EVENT_ITEM_PICKER_QUERY_RESPONSE = "invk_item_picker_query_response"

return M

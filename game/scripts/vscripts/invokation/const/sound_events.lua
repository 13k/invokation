--- Sound event names.
-- @module invokation.const.sound_events
local M = {}

--- Invoker
-- @section invoker

--- Invoker meteor loop
M.SNDEVT_INVOKER_METEOR_LOOP = "Hero_Invoker.ChaosMeteor.Loop"

--- Dummy Target
-- @section dummy

--- dummy creation events
M.SNDEVTS_DUMMY_CREATE = { "Hero_ShadowShaman.Hex.Target" }

--- Combo
-- @section combo

--- start combo events
M.SNDEVTS_COMBO_START = {
  "invoker_invo_begin_01",
  "invoker_invo_move_08",
  "invoker_invo_move_09",
  "invoker_invo_move_13",
  "invoker_invo_attack_05",
  "invoker_invo_ability_invoke_01",
}

--- stop combo events
M.SNDEVTS_COMBO_STOP = { "invoker_invo_failure_04" }

return M

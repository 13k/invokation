local UNITS = require("invk.const.units")

--- Precache constants.
--- @class invk.const.precache
local M = {}

--- Precached units.
M.UNITS = { UNITS.INVOKER, UNITS.DUMMY_TARGET }

--- Precached resources.
M.RESOURCES = {
  ["soundevents/game_sounds_custom.vsndevts"] = "soundfile",
  ["soundevents/game_sounds_heroes/game_sounds_shadowshaman.vsndevts"] = "soundfile",
  ["soundevents/game_sounds_heroes/game_sounds_invoker.vsndevts"] = "soundfile",
  ["soundevents/voscripts/game_sounds_vo_invoker.vsndevts"] = "soundfile",
}

return M

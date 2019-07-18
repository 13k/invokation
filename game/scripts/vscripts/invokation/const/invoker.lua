--- Invoker constants.
-- @module invokation.const.invoker

local M = {}

--- Quas ability name
-- @field[type=string] ABILITY_QUAS
M.ABILITY_QUAS = "invoker_quas"
--- Wex ability name
-- @field[type=string] ABILITY_WEX
M.ABILITY_WEX = "invoker_wex"
--- Exort ability name
-- @field[type=string] ABILITY_EXORT
M.ABILITY_EXORT = "invoker_exort"
--- Empty1 ability name
-- @field[type=string] ABILITY_EMPTY1
M.ABILITY_EMPTY1 = "invoker_empty1"
--- Empty2 ability name
-- @field[type=string] ABILITY_EMPTY2
M.ABILITY_EMPTY2 = "invoker_empty2"
--- Invoke ability name
-- @field[type=string] ABILITY_INVOKE
M.ABILITY_INVOKE = "invoker_invoke"
--- Cold Snap ability name
-- @field[type=string] ABILITY_COLD_SNAP
M.ABILITY_COLD_SNAP = "invoker_cold_snap"
--- Ghost Walk ability name
-- @field[type=string] ABILITY_GHOST_WALK
M.ABILITY_GHOST_WALK = "invoker_ghost_walk"
--- Ice Wall ability name
-- @field[type=string] ABILITY_ICE_WALL
M.ABILITY_ICE_WALL = "invoker_ice_wall"
--- EMP ability name
-- @field[type=string] ABILITY_EMP
M.ABILITY_EMP = "invoker_emp"
--- Tornado ability name
-- @field[type=string] ABILITY_TORNADO
M.ABILITY_TORNADO = "invoker_tornado"
--- Alacrity ability name
-- @field[type=string] ABILITY_ALACRITY
M.ABILITY_ALACRITY = "invoker_alacrity"
--- Sun Strike ability name
-- @field[type=string] ABILITY_SUN_STRIKE
M.ABILITY_SUN_STRIKE = "invoker_sun_strike"
--- Forge Spirit ability name
-- @field[type=string] ABILITY_FORGE_SPIRIT
M.ABILITY_FORGE_SPIRIT = "invoker_forge_spirit"
--- Chaos Meteor ability name
-- @field[type=string] ABILITY_CHAOS_METEOR
M.ABILITY_CHAOS_METEOR = "invoker_chaos_meteor"
--- Deafening Blast ability name
-- @field[type=string] ABILITY_DEAFENING_BLAST
M.ABILITY_DEAFENING_BLAST = "invoker_deafening_blast"

--- List of orb abilities names.
-- @table ORB_ABILITIES
-- @field[type=string] 1 Quas
-- @field[type=string] 2 Wex
-- @field[type=string] 3 Exort
M.ORB_ABILITIES = {
  M.ABILITY_QUAS,
  M.ABILITY_WEX,
  M.ABILITY_EXORT,
}

--- List of orb abilities names.
-- @table SPELL_ABILITIES
-- @field[type=string] 1 Cold Snap
-- @field[type=string] 2 Ghost Walk
-- @field[type=string] 3 Ice Wall
-- @field[type=string] 4 EMP
-- @field[type=string] 5 Tornado
-- @field[type=string] 6 Alacrity
-- @field[type=string] 7 Sun Strike
-- @field[type=string] 8 Forge Spirit
-- @field[type=string] 9 Chaos Meteor
-- @field[type=string] 10 Deafening Blast
M.SPELL_ABILITIES = {
  M.ABILITY_COLD_SNAP,
  M.ABILITY_GHOST_WALK,
  M.ABILITY_ICE_WALL,
  M.ABILITY_EMP,
  M.ABILITY_TORNADO,
  M.ABILITY_ALACRITY,
  M.ABILITY_SUN_STRIKE,
  M.ABILITY_FORGE_SPIRIT,
  M.ABILITY_CHAOS_METEOR,
  M.ABILITY_DEAFENING_BLAST,
}

--- Table of orb abilities composition ("recipes") of spell abilities.
-- @table SPELL_COMPOSITION
-- @field[type=array(string)] ABILITY_COLD_SNAP Cold Snap
-- @field[type=array(string)] ABILITY_GHOST_WALK Ghost Walk
-- @field[type=array(string)] ABILITY_ICE_WALL Ice Wall
-- @field[type=array(string)] ABILITY_EMP EMP
-- @field[type=array(string)] ABILITY_TORNADO Tornado
-- @field[type=array(string)] ABILITY_ALACRITY Alacrity
-- @field[type=array(string)] ABILITY_SUN_STRIKE Sun Strike
-- @field[type=array(string)] ABILITY_FORGE_SPIRIT Forge Spirit
-- @field[type=array(string)] ABILITY_CHAOS_METEOR Chaos Meteor
-- @field[type=array(string)] ABILITY_DEAFENING_BLAST Deafening Blast
M.SPELL_COMPOSITION = {
  [M.ABILITY_COLD_SNAP]       = {M.ABILITY_QUAS,  M.ABILITY_QUAS,  M.ABILITY_QUAS},
  [M.ABILITY_GHOST_WALK]      = {M.ABILITY_QUAS,  M.ABILITY_QUAS,  M.ABILITY_WEX},
  [M.ABILITY_ICE_WALL]        = {M.ABILITY_QUAS,  M.ABILITY_QUAS,  M.ABILITY_EXORT},
  [M.ABILITY_EMP]             = {M.ABILITY_WEX,   M.ABILITY_WEX,   M.ABILITY_WEX},
  [M.ABILITY_TORNADO]         = {M.ABILITY_WEX,   M.ABILITY_WEX,   M.ABILITY_QUAS},
  [M.ABILITY_ALACRITY]        = {M.ABILITY_WEX,   M.ABILITY_WEX,   M.ABILITY_EXORT},
  [M.ABILITY_SUN_STRIKE]      = {M.ABILITY_EXORT, M.ABILITY_EXORT, M.ABILITY_EXORT},
  [M.ABILITY_FORGE_SPIRIT]    = {M.ABILITY_EXORT, M.ABILITY_EXORT, M.ABILITY_QUAS},
  [M.ABILITY_CHAOS_METEOR]    = {M.ABILITY_EXORT, M.ABILITY_EXORT, M.ABILITY_WEX},
  [M.ABILITY_DEAFENING_BLAST] = {M.ABILITY_QUAS,  M.ABILITY_WEX,   M.ABILITY_EXORT},
}

-- empty1 and empty2 can change indices, we're using them only to reference spell slots

--- Quas ability index.
-- @field[type=int] INDEX_ABILITY_QUAS
M.INDEX_ABILITY_QUAS = 0
--- Wex ability index.
-- @field[type=int] INDEX_ABILITY_WEX
M.INDEX_ABILITY_WEX = 1
--- Exort ability index.
-- @field[type=int] INDEX_ABILITY_EXORT
M.INDEX_ABILITY_EXORT = 2
--- Spell slot 1 ability index.
-- @field[type=int] INDEX_ABILITY_EMPTY1
M.INDEX_ABILITY_EMPTY1 = 3
--- Spell slot 2 ability index.
-- @field[type=int] INDEX_ABILITY_EMPTY2
M.INDEX_ABILITY_EMPTY2 = 4
--- Invoke ability index.
-- @field[type=int] INDEX_ABILITY_INVOKE
M.INDEX_ABILITY_INVOKE = 5

--- Table of ability indices by ability name.
-- @table ABILITY_INDICES
-- @field[type=int] ABILITY_QUAS Quas
-- @field[type=int] ABILITY_WEX Wex
-- @field[type=int] ABILITY_EXORT Exort
-- @field[type=int] ABILITY_EMPTY1 Spell slot 1
-- @field[type=int] ABILITY_EMPTY2 Spell slot 2
-- @field[type=int] ABILITY_INVOKE Invoke
M.ABILITY_INDICES = {
  [M.ABILITY_QUAS] = M.INDEX_ABILITY_QUAS,
  [M.ABILITY_WEX] = M.INDEX_ABILITY_WEX,
  [M.ABILITY_EXORT] = M.INDEX_ABILITY_EXORT,
  [M.ABILITY_EMPTY1] = M.INDEX_ABILITY_EMPTY1,
  [M.ABILITY_EMPTY2] = M.INDEX_ABILITY_EMPTY2,
  [M.ABILITY_INVOKE] = M.INDEX_ABILITY_INVOKE,
}

--- Maximum index of the last visible ability.
--
-- Abilities with index higher than this are hidden.
--- @field[type=int] MAX_VISIBLE_ABILITY_INDEX
M.MAX_VISIBLE_ABILITY_INDEX = 5

return M

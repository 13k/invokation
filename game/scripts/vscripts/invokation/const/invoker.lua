--- Invoker constants.
-- @module invokation.const.invoker

local m = require("moses")
local Talents = require("invokation.dota2.talents")
local HeroKeyValues = require("invokation.dota2.kv.HeroKeyValues")
local AbilityKeyValues = require("invokation.dota2.kv.AbilityKeyValues")

local UNITS = require("invokation.const.units")
local HEROES = require("invokation.const.heroes")
local ABILITIES = require("invokation.const.abilities")

local M = {}

local FMT_ABILITY_TALENT_CONST_NAME = "ABILITY_TALENT_L%d_%s"

--- Hero id
-- @tfield int HERO_ID
M.HERO_ID = 74

--- Unit name
-- @tfield string UNIT_NAME
M.UNIT_NAME = UNITS.INVOKER

--- Raw KeyValues table
-- @table KEY_VALUES
M.KEY_VALUES = HEROES.KEY_VALUES[M.UNIT_NAME]

--- @{dota2.kv.HeroKeyValues} instance
M.HERO_KEY_VALUES = HeroKeyValues(M.UNIT_NAME, M.KEY_VALUES)

--- Quas ability name
-- @tfield string ABILITY_QUAS
M.ABILITY_QUAS = "invoker_quas"
--- Wex ability name
-- @tfield string ABILITY_WEX
M.ABILITY_WEX = "invoker_wex"
--- Exort ability name
-- @tfield string ABILITY_EXORT
M.ABILITY_EXORT = "invoker_exort"
--- Empty1 ability name
-- @tfield string ABILITY_EMPTY1
M.ABILITY_EMPTY1 = "invoker_empty1"
--- Empty2 ability name
-- @tfield string ABILITY_EMPTY2
M.ABILITY_EMPTY2 = "invoker_empty2"
--- Invoke ability name
-- @tfield string ABILITY_INVOKE
M.ABILITY_INVOKE = "invoker_invoke"
--- Cold Snap ability name
-- @tfield string ABILITY_COLD_SNAP
M.ABILITY_COLD_SNAP = "invoker_cold_snap"
--- Ghost Walk ability name
-- @tfield string ABILITY_GHOST_WALK
M.ABILITY_GHOST_WALK = "invoker_ghost_walk"
--- Ice Wall ability name
-- @tfield string ABILITY_ICE_WALL
M.ABILITY_ICE_WALL = "invoker_ice_wall"
--- EMP ability name
-- @tfield string ABILITY_EMP
M.ABILITY_EMP = "invoker_emp"
--- Tornado ability name
-- @tfield string ABILITY_TORNADO
M.ABILITY_TORNADO = "invoker_tornado"
--- Alacrity ability name
-- @tfield string ABILITY_ALACRITY
M.ABILITY_ALACRITY = "invoker_alacrity"
--- Sun Strike ability name
-- @tfield string ABILITY_SUN_STRIKE
M.ABILITY_SUN_STRIKE = "invoker_sun_strike"
--- Forge Spirit ability name
-- @tfield string ABILITY_FORGE_SPIRIT
M.ABILITY_FORGE_SPIRIT = "invoker_forge_spirit"
--- Chaos Meteor ability name
-- @tfield string ABILITY_CHAOS_METEOR
M.ABILITY_CHAOS_METEOR = "invoker_chaos_meteor"
--- Deafening Blast ability name
-- @tfield string ABILITY_DEAFENING_BLAST
M.ABILITY_DEAFENING_BLAST = "invoker_deafening_blast"

--- Level 10 right talent ability name
-- @tfield string ABILITY_TALENT_L10_RIGHT

--- Level 10 left talent ability name
-- @tfield string ABILITY_TALENT_L10_LEFT

--- Level 15 right talent ability name
-- @tfield string ABILITY_TALENT_L15_RIGHT

--- Level 15 left talent ability name
-- @tfield string ABILITY_TALENT_L15_LEFT

--- Level 20 right talent ability name
-- @tfield string ABILITY_TALENT_L20_RIGHT

--- Level 20 left talent ability name
-- @tfield string ABILITY_TALENT_L20_LEFT

--- Level 25 right talent ability name
-- @tfield string ABILITY_TALENT_L25_RIGHT

--- Level 25 left talent ability name
-- @tfield string ABILITY_TALENT_L25_LEFT

for enumValue, abilityName in pairs(M.HERO_KEY_VALUES:Talents()) do
  local constName = FMT_ABILITY_TALENT_CONST_NAME:format(Talents.LevelAndSide(enumValue))
  M[constName] = abilityName
end

--- Array of orb abilities names.
-- @table ORB_ABILITIES
-- @tfield string 1 Quas
-- @tfield string 2 Wex
-- @tfield string 3 Exort
M.ORB_ABILITIES = { M.ABILITY_QUAS, M.ABILITY_WEX, M.ABILITY_EXORT }

--- Array of orb abilities names.
-- @table SPELL_ABILITIES
-- @tfield string 1 Cold Snap
-- @tfield string 2 Ghost Walk
-- @tfield string 3 Ice Wall
-- @tfield string 4 EMP
-- @tfield string 5 Tornado
-- @tfield string 6 Alacrity
-- @tfield string 7 Sun Strike
-- @tfield string 8 Forge Spirit
-- @tfield string 9 Chaos Meteor
-- @tfield string 10 Deafening Blast
M.SPELL_ABILITIES =
  {
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

--- Array of talent abilities names.
-- @table TALENT_ABILITIES
-- @tfield string 1 Level 10 right
-- @tfield string 2 Level 10 left
-- @tfield string 3 Level 15 right
-- @tfield string 4 Level 15 left
-- @tfield string 5 Level 20 right
-- @tfield string 6 Level 20 left
-- @tfield string 7 Level 25 right
-- @tfield string 8 Level 25 left
M.TALENT_ABILITIES = m.values(M.HERO_KEY_VALUES:Talents())

--- Abilities KeyValues
-- @table ABILITIES_KEY_VALUES
-- @tfield AbilityKeyValues ABILITY_QUAS
-- @tfield AbilityKeyValues ABILITY_WEX
-- @tfield AbilityKeyValues ABILITY_EXORT
-- @tfield AbilityKeyValues ABILITY_COLD_SNAP
-- @tfield AbilityKeyValues ABILITY_GHOST_WALK
-- @tfield AbilityKeyValues ABILITY_ICE_WALL
-- @tfield AbilityKeyValues ABILITY_EMP
-- @tfield AbilityKeyValues ABILITY_TORNADO
-- @tfield AbilityKeyValues ABILITY_ALACRITY
-- @tfield AbilityKeyValues ABILITY_SUN_STRIKE
-- @tfield AbilityKeyValues ABILITY_FORGE_SPIRIT
-- @tfield AbilityKeyValues ABILITY_CHAOS_METEOR
-- @tfield AbilityKeyValues ABILITY_DEAFENING_BLAST
-- @tfield AbilityKeyValues ABILITY_TALENT_1
-- @tfield AbilityKeyValues ABILITY_TALENT_2
-- @tfield AbilityKeyValues ABILITY_TALENT_3
-- @tfield AbilityKeyValues ABILITY_TALENT_4
-- @tfield AbilityKeyValues ABILITY_TALENT_5
-- @tfield AbilityKeyValues ABILITY_TALENT_6
-- @tfield AbilityKeyValues ABILITY_TALENT_7
-- @tfield AbilityKeyValues ABILITY_TALENT_8
M.ABILITIES_KEY_VALUES = {}

for _, abilityName in ipairs(M.ORB_ABILITIES) do
  M.ABILITIES_KEY_VALUES[abilityName] = AbilityKeyValues(abilityName, ABILITIES.KEY_VALUES[abilityName])
end

for _, abilityName in ipairs(M.SPELL_ABILITIES) do
  M.ABILITIES_KEY_VALUES[abilityName] = AbilityKeyValues(abilityName, ABILITIES.KEY_VALUES[abilityName])
end

for _, abilityName in ipairs(M.TALENT_ABILITIES) do
  M.ABILITIES_KEY_VALUES[abilityName] = AbilityKeyValues(abilityName, ABILITIES.KEY_VALUES[abilityName])
end

--- Table of orb abilities composition ("recipes") of spell abilities.
-- @table SPELL_COMPOSITION
-- @tfield {string,...} ABILITY_COLD_SNAP Cold Snap
-- @tfield {string,...} ABILITY_GHOST_WALK Ghost Walk
-- @tfield {string,...} ABILITY_ICE_WALL Ice Wall
-- @tfield {string,...} ABILITY_EMP EMP
-- @tfield {string,...} ABILITY_TORNADO Tornado
-- @tfield {string,...} ABILITY_ALACRITY Alacrity
-- @tfield {string,...} ABILITY_SUN_STRIKE Sun Strike
-- @tfield {string,...} ABILITY_FORGE_SPIRIT Forge Spirit
-- @tfield {string,...} ABILITY_CHAOS_METEOR Chaos Meteor
-- @tfield {string,...} ABILITY_DEAFENING_BLAST Deafening Blast
M.SPELL_COMPOSITION = {
  [M.ABILITY_COLD_SNAP] = { M.ABILITY_QUAS, M.ABILITY_QUAS, M.ABILITY_QUAS },
  [M.ABILITY_GHOST_WALK] = { M.ABILITY_QUAS, M.ABILITY_QUAS, M.ABILITY_WEX },
  [M.ABILITY_ICE_WALL] = { M.ABILITY_QUAS, M.ABILITY_QUAS, M.ABILITY_EXORT },
  [M.ABILITY_EMP] = { M.ABILITY_WEX, M.ABILITY_WEX, M.ABILITY_WEX },
  [M.ABILITY_TORNADO] = { M.ABILITY_WEX, M.ABILITY_WEX, M.ABILITY_QUAS },
  [M.ABILITY_ALACRITY] = { M.ABILITY_WEX, M.ABILITY_WEX, M.ABILITY_EXORT },
  [M.ABILITY_SUN_STRIKE] = { M.ABILITY_EXORT, M.ABILITY_EXORT, M.ABILITY_EXORT },
  [M.ABILITY_FORGE_SPIRIT] = { M.ABILITY_EXORT, M.ABILITY_EXORT, M.ABILITY_QUAS },
  [M.ABILITY_CHAOS_METEOR] = { M.ABILITY_EXORT, M.ABILITY_EXORT, M.ABILITY_WEX },
  [M.ABILITY_DEAFENING_BLAST] = { M.ABILITY_QUAS, M.ABILITY_WEX, M.ABILITY_EXORT },
}

-- empty1 and empty2 can change indices, we're using them only to reference spell slots

--- Quas ability index.
-- @tfield int INDEX_ABILITY_QUAS
M.INDEX_ABILITY_QUAS = 0
--- Wex ability index.
-- @tfield int INDEX_ABILITY_WEX
M.INDEX_ABILITY_WEX = 1
--- Exort ability index.
-- @tfield int INDEX_ABILITY_EXORT
M.INDEX_ABILITY_EXORT = 2
--- Spell slot 1 ability index.
-- @tfield int INDEX_ABILITY_EMPTY1
M.INDEX_ABILITY_EMPTY1 = 3
--- Spell slot 2 ability index.
-- @tfield int INDEX_ABILITY_EMPTY2
M.INDEX_ABILITY_EMPTY2 = 4
--- Invoke ability index.
-- @tfield int INDEX_ABILITY_INVOKE
M.INDEX_ABILITY_INVOKE = 5

--- Table of ability indices by ability name.
-- @table ABILITY_INDICES
-- @tfield int ABILITY_QUAS Quas
-- @tfield int ABILITY_WEX Wex
-- @tfield int ABILITY_EXORT Exort
-- @tfield int ABILITY_EMPTY1 Spell slot 1
-- @tfield int ABILITY_EMPTY2 Spell slot 2
-- @tfield int ABILITY_INVOKE Invoke
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
--- @tfield int MAX_VISIBLE_ABILITY_INDEX
M.MAX_VISIBLE_ABILITY_INDEX = 5

return M
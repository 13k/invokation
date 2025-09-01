local HeroKeyValues = require("invk.dota2.kv.hero_key_values")
local UNITS = require("invk.const.units")
local talents = require("invk.dota2.talents")
local tbl = require("invk.lang.table")

local FMT_ABILITY_TALENT_CONST_NAME = "TALENT_L%d_%s"

--- @type { [string]: boolean }
local SKIP_SERIALIZATION = {}

--- @param name string
local function skip_serialize(name)
  SKIP_SERIALIZATION[name] = true
end

--- Invoker constants.
--- @class invk.const.invoker
--- @field private __serialized invk.dota2.KeyValues?
local M = {
  __serialized = nil,
}

--- @return invk.dota2.KeyValues
function M:serialize()
  if self.__serialized == nil then
    self.__serialized = tbl.filter(self --[[@as table]], function(_, key)
      return not SKIP_SERIALIZATION[key]
    end)
  end

  return self.__serialized
end

(function()
  local hero_kv = HeroKeyValues:load(UNITS.INVOKER)

  --- Hero id
  M.HERO_ID = hero_kv:require_integer("HeroID")

  --- Unit name
  M.UNIT_NAME = UNITS.INVOKER

  --- Units spawned by Invoker (copy of [invk.const.units.INVOKER_SPAWNED])
  M.SPAWNED_UNITS = UNITS.INVOKER_SPAWNED

  --- [invk.dota2.kv.HeroKeyValues] instance
  M.KEY_VALUES = hero_kv

  skip_serialize("KEY_VALUES")

  --- @class invk.dota2.invoker.AbilityNames
  --- @field TALENT_L10_RIGHT invk.dota2.invoker.AbilityName # Level 10 right talent ability name
  --- @field TALENT_L10_LEFT invk.dota2.invoker.AbilityName # Level 10 left talent ability name
  --- @field TALENT_L15_RIGHT invk.dota2.invoker.AbilityName # Level 15 right talent ability name
  --- @field TALENT_L15_LEFT invk.dota2.invoker.AbilityName # Level 15 left talent ability name
  --- @field TALENT_L20_RIGHT invk.dota2.invoker.AbilityName # Level 20 right talent ability name
  --- @field TALENT_L20_LEFT invk.dota2.invoker.AbilityName # Level 20 left talent ability name
  --- @field TALENT_L25_RIGHT invk.dota2.invoker.AbilityName # Level 25 right talent ability name
  --- @field TALENT_L25_LEFT invk.dota2.invoker.AbilityName # Level 25 left talent ability name
  M.AbilityName = {
    --- Quas ability name
    QUAS = "invoker_quas",
    --- Wex ability name
    WEX = "invoker_wex",
    --- Exort ability name
    EXORT = "invoker_exort",
    --- Empty1 ability name
    EMPTY1 = "invoker_empty1",
    --- Empty2 ability name
    EMPTY2 = "invoker_empty2",
    --- Invoke ability name
    INVOKE = "invoker_invoke",
    --- Cold Snap ability name
    COLD_SNAP = "invoker_cold_snap",
    --- Ghost Walk ability name
    GHOST_WALK = "invoker_ghost_walk",
    --- Ice Wall ability name
    ICE_WALL = "invoker_ice_wall",
    --- EMP ability name
    EMP = "invoker_emp",
    --- Tornado ability name
    TORNADO = "invoker_tornado",
    --- Alacrity ability name
    ALACRITY = "invoker_alacrity",
    --- Sun Strike ability name
    SUN_STRIKE = "invoker_sun_strike",
    --- Forge Spirit ability name
    FORGE_SPIRIT = "invoker_forge_spirit",
    --- Chaos Meteor ability name
    CHAOS_METEOR = "invoker_chaos_meteor",
    --- Deafening Blast ability name
    DEAFENING_BLAST = "invoker_deafening_blast",
  }

  for enum_value, ability_name in pairs(M.KEY_VALUES.talents) do
    local level_side = assertf(
      talents.level_and_side(enum_value),
      "could not find LevelAndSide() for talents value %d",
      enum_value
    )

    local level = level_side[1]
    local side = tostring(level_side[2]):upper()
    local const_name = F(FMT_ABILITY_TALENT_CONST_NAME, level, side)

    M.AbilityName[const_name] = ability_name
  end

  --- Tuple of orb abilities names.
  ---
  --- 1. Quas
  --- 2. Wex
  --- 3. Exort
  ---
  --- @type invk.dota2.invoker.OrbTriplet
  M.ORB_ABILITIES = { M.AbilityName.QUAS, M.AbilityName.WEX, M.AbilityName.EXORT }

  --- List of orb abilities names.
  ---
  --- 1. Cold Snap
  --- 2. Ghost Walk
  --- 3. Ice Wall
  --- 4. EMP
  --- 5. Tornado
  --- 6. Alacrity
  --- 7. Sun Strike
  --- 8. Forge Spirit
  --- 9. Chaos Meteor
  --- 10. Deafening Blast
  ---
  --- @type invk.dota2.invoker.AbilityName[]
  M.SPELL_ABILITIES = {
    M.AbilityName.COLD_SNAP,
    M.AbilityName.GHOST_WALK,
    M.AbilityName.ICE_WALL,
    M.AbilityName.EMP,
    M.AbilityName.TORNADO,
    M.AbilityName.ALACRITY,
    M.AbilityName.SUN_STRIKE,
    M.AbilityName.FORGE_SPIRIT,
    M.AbilityName.CHAOS_METEOR,
    M.AbilityName.DEAFENING_BLAST,
  }

  --- Array of talent abilities names.
  --- @type invk.dota2.invoker.AbilityName[]
  M.TALENT_ABILITIES = tbl.values(M.KEY_VALUES.talents)

  --- Table of orb abilities composition ("recipes") of spell abilities.
  --- @type { [invk.dota2.invoker.AbilityName]: invk.dota2.invoker.OrbTriplet }
  M.SPELL_COMPOSITION = {
    [M.AbilityName.COLD_SNAP] = {
      M.AbilityName.QUAS,
      M.AbilityName.QUAS,
      M.AbilityName.QUAS,
    },
    [M.AbilityName.GHOST_WALK] = {
      M.AbilityName.QUAS,
      M.AbilityName.QUAS,
      M.AbilityName.WEX,
    },
    [M.AbilityName.ICE_WALL] = {
      M.AbilityName.QUAS,
      M.AbilityName.QUAS,
      M.AbilityName.EXORT,
    },
    [M.AbilityName.EMP] = {
      M.AbilityName.WEX,
      M.AbilityName.WEX,
      M.AbilityName.WEX,
    },
    [M.AbilityName.TORNADO] = {
      M.AbilityName.WEX,
      M.AbilityName.WEX,
      M.AbilityName.QUAS,
    },
    [M.AbilityName.ALACRITY] = {
      M.AbilityName.WEX,
      M.AbilityName.WEX,
      M.AbilityName.EXORT,
    },
    [M.AbilityName.SUN_STRIKE] = {
      M.AbilityName.EXORT,
      M.AbilityName.EXORT,
      M.AbilityName.EXORT,
    },
    [M.AbilityName.FORGE_SPIRIT] = {
      M.AbilityName.EXORT,
      M.AbilityName.EXORT,
      M.AbilityName.QUAS,
    },
    [M.AbilityName.CHAOS_METEOR] = {
      M.AbilityName.EXORT,
      M.AbilityName.EXORT,
      M.AbilityName.WEX,
    },
    [M.AbilityName.DEAFENING_BLAST] = {
      M.AbilityName.QUAS,
      M.AbilityName.WEX,
      M.AbilityName.EXORT,
    },
  }

  --- EMPTY1 and EMPTY2 can change indices, we're using them only to reference spell slots
  --- @enum invk.dota2.invoker.AbilityIndex
  M.AbilityIndex = {
    --- Quas ability index.
    QUAS = 0,
    --- Wex ability index.
    WEX = 1,
    --- Exort ability index.
    EXORT = 2,
    --- Spell slot 1 ability index.
    EMPTY1 = 3,
    --- Spell slot 2 ability index.
    EMPTY2 = 4,
    --- Invoke ability index.
    INVOKE = 5,
  }

  --- Maximum index of the last visible ability.
  ---
  --- Abilities with index higher than this are hidden.
  M.MAX_VISIBLE_ABILITY_INDEX = M.AbilityIndex.INVOKE

  M.FACETS = M.KEY_VALUES:require_kv("Facets")

  skip_serialize("FACETS")
end)()

return M

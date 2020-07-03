--- HeroKeyValues class.
-- @classmod invokation.dota2.kv.HeroKeyValues
local m = require("moses")
local class = require("pl.class")
local Talents = require("invokation.dota2.talents")

local M = class()

local ABILITY_KEY_PATT = "^Ability(%d+)$"

--- Constructor.
-- @tparam string name Hero name
-- @tparam {[string]=any,...} kv KeyValues data
function M:_init(name, kv)
  self.Name = name

  m.extend(self, kv)
end

--- Serializes the KeyValues data
-- @treturn {[string]=any,...} Serialized data
function M:Serialize()
  if self.__data == nil then
    self.__data = m.omit(self, m.functions(self))
  end

  return self.__data
end

--- Returns an iterator function that iterates over the KeyValues entries.
-- @treturn iter(string,any)
function M:Entries()
  return pairs(self:Serialize())
end

local function selectAbilityEntry(key, value)
  local mAbilityId = key:match(ABILITY_KEY_PATT)

  if mAbilityId ~= nil then
    return tonumber(mAbilityId), value
  end

  return nil, nil
end

--- Returns an array of ability names.
-- @treturn {string,...} Array of ability names
function M:Abilities()
  if self.abilities == nil then
    self.abilities = m.map(self:Serialize(), m.rearg(selectAbilityEntry, {2, 1}))
  end

  return self.abilities
end

--- Returns an array of talent ability names.
-- @treturn talents.Talents Table of talent ability names
function M:Talents()
  if self.talents == nil then
    self.talents = Talents.NamesArrayToEnumsTable(m.chain(self:Abilities()):slice(self.AbilityTalentStart):compact()
                                                    :value())
  end

  return self.talents
end

return M

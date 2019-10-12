--- HeroKeyValues class.
-- @classmod invokation.dota2.kv.HeroKeyValues

local m = require("moses")

local M = require("pl.class")()

local ABILITY_KEY_PATT = "^Ability(%d+)$"

--- Constructor.
-- @tparam string name Hero name
-- @tparam table kv KeyValues table
function M:_init(name, kv)
  self.Name = name

  m.extend(self, kv)
end

--- Serialize the KeyValues
-- @treturn table
function M:Serialize()
  if self.__data == nil then
    self.__data = m.omit(self, m.functions(self))
  end

  return self.__data
end

--- Returns an iterator function that iterates over the KeyValues entries.
-- @treturn function
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

--- Returns a list of ability names.
-- @treturn array(string) List of ability names
function M:Abilities()
  if self.abilities == nil then
    self.abilities = m.map(self:Serialize(), m.rearg(selectAbilityEntry, { 2, 1 }))
  end

  return self.abilities
end

--- Returns a list of talent ability names.
--
-- Talents are ordered from lowest to highest level, right to left.
-- (Level 10 right, Level 10 left, Level 15 right, Level 15 left, ...)
--
-- @treturn array(string) List of talent ability names
function M:Talents()
  if self.talents == nil then
    self.talents = m.chain(self:Abilities()):slice(self.AbilityTalentStart):compact():value()
  end

  return self.talents
end

return M

--- HeroKeyValues class.
-- @classmod invokation.dota2.kv.HeroKeyValues

local M = require("pl.class")()

local ABILITY_KEY_PATT = "^Ability(%d+)$"

--- Constructor.
-- @tparam table kv KeyValues table for the hero
function M:_init(kv)
  self.kv = kv
end

--- Serialize the KeyValues
-- @treturn table
function M:Serialize()
  return self.kv
end

--- Returns a list of ability names.
-- @treturn array(string) List of ability names
function M:Abilities()
  if self.abilities == nil then
    self.abilities = {}

    for key, value in pairs(self.kv) do
      local mAbilityID = key:match(ABILITY_KEY_PATT)

      if mAbilityID ~= nil then
        local abilityID = tonumber(mAbilityID)
        self.abilities[abilityID] = value
      end
    end
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
    self.talents = {}

    for i = self.kv.AbilityTalentStart, #self:Abilities() do
      table.insert(self.talents, self:Abilities()[i])
    end
  end

  return self.talents
end

return M

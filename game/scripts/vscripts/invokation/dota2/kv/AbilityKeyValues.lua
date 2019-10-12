--- AbilityKeyValues class.
-- @classmod invokation.dota2.kv.AbilityKeyValues

local m = require("moses")
local KV = require("invokation.dota2.kv")

local M = require("pl.class")()

--- Constructor.
-- @tparam string name Ability name
-- @tparam table kv KeyValues table for the ability
function M:_init(name, kv)
  self.Name = name

  m.extend(self, kv)

  self.AbilitySpecial = KV.AbilitySpecials(kv.AbilitySpecial)
  self.AbilityBehavior = KV.Flags(kv.AbilityBehavior)
  self.AbilityUnitTargetFlags = KV.Flags(kv.AbilityUnitTargetFlags)
  self.AbilityUnitTargetTeam = KV.EnumValues(kv.AbilityUnitTargetTeam)
  self.AbilityUnitTargetType = KV.Flags(kv.AbilityUnitTargetType)
  self.AbilityCastPoint = KV.Numbers(kv.AbilityCastPoint)
  self.AbilityCastRange = KV.Numbers(kv.AbilityCastRange)
  self.AbilityChannelTime = KV.Numbers(kv.AbilityChannelTime)
  self.AbilityCooldown = KV.Numbers(kv.AbilityCooldown)
  self.AbilityDamage = KV.Numbers(kv.AbilityDamage)
  self.AbilityDuration = KV.Numbers(kv.AbilityDuration)
  self.AbilityManaCost = KV.Numbers(kv.AbilityManaCost)
  self.AbilityCastAnimation = KV.EnumValue(kv.AbilityCastAnimation)
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

return M

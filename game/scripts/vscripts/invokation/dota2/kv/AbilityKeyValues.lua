--- AbilityKeyValues class.
-- @classmod invokation.dota2.kv.AbilityKeyValues
local m = require("moses")
local KV = require("invokation.dota2.kv")
local class = require("pl.class")

local M = class()

--- Constructor.
-- @tparam string name Ability name
-- @tparam {[string]=any,...} kv KeyValues data
function M:_init(name, kv)
  local fields = m.extend({}, { Name = name }, kv)

  m.extend(self, fields)

  self.__data = fields
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

--- Serializes the KeyValues data
-- @treturn {[string]=any,...} Serialized data
function M:Serialize()
  return self.__data
end

--- Returns an iterator function that iterates over the KeyValues entries.
-- @treturn iter(string,any)
function M:Entries()
  return pairs(self:Serialize())
end

return M

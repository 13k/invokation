--- AbilityKeyValues class.
-- @classmod invokation.dota2.kv.AbilityKeyValues

local M = require("pl.class")()

local KV = require("invokation.dota2.kv")
local func = require("pl.func")

local function normalize(kv)
  kv.AbilitySpecial = KV.List(kv.AbilitySpecial)
  kv.AbilityBehavior = KV.MultiValue(kv.AbilityBehavior, "|")
  kv.AbilityUnitTargetFlags = KV.MultiValue(kv.AbilityUnitTargetFlags, "|")
  kv.AbilityUnitTargetTeam = KV.MultiValue(kv.AbilityUnitTargetTeam, "|")
  kv.AbilityUnitTargetType = KV.MultiValue(kv.AbilityUnitTargetType, "|")
  kv.AbilityCastPoint = KV.MultiValue(kv.AbilityCastPoint, " ", "number")
  kv.AbilityCastRange = KV.MultiValue(kv.AbilityCastRange, " ", "number")
  kv.AbilityChannelTime = KV.MultiValue(kv.AbilityChannelTime, " ", "number")
  kv.AbilityCooldown = KV.MultiValue(kv.AbilityCooldown, " ", "number")
  kv.AbilityDamage = KV.MultiValue(kv.AbilityDamage, " ", "number")
  kv.AbilityDuration = KV.MultiValue(kv.AbilityDuration, " ", "number")
  kv.AbilityManaCost = KV.MultiValue(kv.AbilityManaCost, " ", "number")

  return kv
end

--- Constructor.
--
-- It will normalize the following KeyValues entries:
--
-- - **AbilitySpecial**: (_list_) convert to numeric indices list
-- - **AbilityBehavior**: (_list_) split the original string by `"|"`
-- - **AbilityUnitTargetFlags**: (_list_) split the original string by `"|"`
-- - **AbilityUnitTargetTeam**: (_list_) split the original string by `"|"`
-- - **AbilityUnitTargetType**: (_list_) split the original string by `"|"`
-- - **AbilityCastPoint**: (_list_) split the original string by `" "`
-- - **AbilityCastRange**: (_list_) split the original string by `" "`
-- - **AbilityChannelTime**: (_list_) split the original string by `" "`
-- - **AbilityCooldown**: (_list_) split the original string by `" "`
-- - **AbilityDamage**: (_list_) split the original string by `" "`
-- - **AbilityDuration**: (_list_) split the original string by `" "`
-- - **AbilityManaCost**: (_list_) split the original string by `" "`
--
-- @tparam string name Ability name
-- @tparam table kv KeyValues table for the ability
function M:_init(name, kv)
  self.Name = name
  self.kv = normalize(kv)
end

--- Serialize the KeyValues
-- @treturn table
function M:Serialize()
  return self.kv
end

return M

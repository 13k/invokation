--- Ability class that represents either an ability or item.
-- @classmod invokation.dota2.Ability
local m = require("moses")
local class = require("pl.class")
local delegation = require("invokation.lang.delegation")

local INVOKER = require("invokation.const.invoker")

local M = class()

local ORB_ABILITIES = m.map(INVOKER.ORB_ABILITIES, function(ability)
  return ability, true
end)

local DELEGATES = { "GetDuration", "GetSpecialValueFor", "IsItem" }

delegation.delegate(M, "entity", DELEGATES)

--- Constructor.
-- @tparam CDOTABaseAbility|CDOTA_Item entity Ability or item entity
function M:_init(entity)
  self.entity = entity
  self.name = self.entity:GetAbilityName()
  self.index = self.entity:GetAbilityIndex()
end

--- Checks if this ability is an Invoker orb ability (quas, wex or exort).
-- @treturn bool `true` if it's an orb ability, `false` otherwise
function M:IsOrbAbility()
  return m.toBoolean(ORB_ABILITIES[self.name])
end

--- Checks if this ability is an Invoker "invocation" ability (quas, wex, exort or invoke).
-- @treturn bool `true` if it's an invocation ability, `false` otherwise
function M:IsInvocationAbility()
  return self:IsOrbAbility() or self.name == INVOKER.ABILITY_INVOKE
end

return M

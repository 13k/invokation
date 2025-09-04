local class = require("middleclass")

local INVOKER = require("invk.const.invoker")
local tbl = require("invk.lang.table")

--- @alias invk.dota2.AbilityOrItem (CDOTABaseAbility | CDOTA_Item)

--- Ability class that represents either an ability or item.
--- @class invk.dota2.Ability : middleclass.Class
--- @field entity invk.dota2.AbilityOrItem
--- @field name string
--- @field index integer
--- @field is_item boolean
local M = class("invk.dota2.Ability")

local ORB_ABILITIES = tbl.reduce(INVOKER.ORB_ABILITIES, function(h, ability)
  h[ability] = true
  return h
end, {} --[[@as { [string]: boolean } ]])

--- Constructor.
--- @param entity invk.dota2.AbilityOrItem # Ability or item entity
function M:initialize(entity)
  self.entity = entity
  self.name = self.entity:GetAbilityName()
  self.index = self.entity:GetAbilityIndex()
  self.is_item = self.entity:IsItem()
end

--- Checks if this ability is an Invoker orb ability (quas, wex or exort).
--- @return boolean # `true` if it's an orb ability, `false` otherwise
function M:is_orb_ability()
  return ORB_ABILITIES[self.name] ~= nil
end

--- Checks if this ability is an Invoker "invocation" ability (quas, wex, exort or invoke).
--- @return boolean # `true` if it's an invocation ability, `false` otherwise
function M:is_invocation_ability()
  return self:is_orb_ability() or self.name == INVOKER.AbilityName.INVOKE
end

--- @return number
function M:duration()
  return self.entity:GetDuration()
end

--- @param name string
--- @return number
function M:get_special_value_for(name)
  return self.entity:GetSpecialValueFor(name)
end

return M

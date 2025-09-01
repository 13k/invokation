local class = require("pl.class")
local m = require("moses")

local CBaseEntity = require("support.dota2.CBaseEntity")

--- @class support.dota2.CDOTABaseAbility : support.dota2.CBaseEntity, CDOTABaseAbility
--- @field index integer
--- @field is_item boolean
--- @field level integer
--- @field special { [string]: any }
--- @field AbilityBehavior string
--- @field AbilityDuration number
--- @field MaxLevel integer
local CDOTABaseAbility = class(CBaseEntity)

--- @class (partial) support.dota2.CDOTABaseAbility_attributes : support.dota2.CBaseEntity_attributes
--- @field index? integer
--- @field is_item? boolean
--- @field level? integer
--- @field special? { [string]: any }
--- @field AbilityBehavior? string
--- @field AbilityDuration? number
--- @field MaxLevel? integer

--- @type support.dota2.CDOTABaseAbility_attributes
local ATTRIBUTES = {
  level = 0,
  MaxLevel = 1,
}

--- @param attributes support.dota2.CDOTABaseAbility_attributes
function CDOTABaseAbility:_init(attributes)
  self:super(m.extend({}, ATTRIBUTES, attributes or {}))
end

function CDOTABaseAbility:GetAbilityName()
  return self.name
end

function CDOTABaseAbility:GetAbilityIndex()
  return self.index
end

function CDOTABaseAbility:SetAbilityIndex(i)
  self.index = i
end

function CDOTABaseAbility:GetDuration()
  return self.AbilityDuration
end

function CDOTABaseAbility:GetMaxLevel()
  return self.MaxLevel
end

function CDOTABaseAbility:GetLevel()
  return self.level
end

function CDOTABaseAbility:SetLevel(level)
  self.level = level
end

function CDOTABaseAbility:IsItem()
  return self.is_item
end

function CDOTABaseAbility:UpgradeAbility(_supressSpeech)
  if self:CanAbilityBeUpgraded() == ABILITY_CAN_BE_UPGRADED then
    self:SetLevel(self:GetLevel() + 1)
  end
end

function CDOTABaseAbility:CanAbilityBeUpgraded()
  if self.level == self.MaxLevel then
    return ABILITY_CANNOT_BE_UPGRADED_AT_MAX
  end

  if type(self.AbilityBehavior) ~= "string" then
    -- error(string.format("CDOTABaseAbility: 'AbilityBehavior' is not set (name=%q)", self.name))
    -- hack: talent abilities
    return ABILITY_CAN_BE_UPGRADED
  end

  if self.AbilityBehavior:match("DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE") then
    return ABILITY_NOT_LEARNABLE
  end

  if self.AbilityBehavior:match("DOTA_ABILITY_BEHAVIOR_HIDDEN") then
    return ABILITY_CANNOT_BE_UPGRADED_NOT_UPGRADABLE
  end

  return ABILITY_CAN_BE_UPGRADED
end

function CDOTABaseAbility:GetSpecialValueFor(key)
  return m.path(self, "special", key)
end

function CDOTABaseAbility:EndCooldown() end

return CDOTABaseAbility

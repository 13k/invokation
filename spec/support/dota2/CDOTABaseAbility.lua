local m = require("moses")
local class = require("pl.class")

-- selene: allow(incorrect_standard_library_use)
CDOTABaseAbility = class(CBaseEntity)

local DEFAULTS = { level = 0, MaxLevel = 1 }

function CDOTABaseAbility:_init(attributes)
  self:super(m.extend({}, DEFAULTS, attributes or {}))
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

function CDOTABaseAbility:UpgradeAbility(_supressSpeech)
  if self:CanAbilityBeUpgraded() then
    self:SetLevel(self:GetLevel() + 1)
  end
end

function CDOTABaseAbility:CanAbilityBeUpgraded()
  if self.AbilityBehavior:match("DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE") then
    return ABILITY_NOT_LEARNABLE
  end

  if self.AbilityBehavior:match("DOTA_ABILITY_BEHAVIOR_HIDDEN") then
    return ABILITY_CANNOT_BE_UPGRADED_NOT_UPGRADABLE
  end

  if self.level == self.MaxLevel then
    return ABILITY_CANNOT_BE_UPGRADED_AT_MAX
  end

  return ABILITY_CAN_BE_UPGRADED
end

function CDOTABaseAbility:GetSpecialValueFor(key)
  return m.path(self, "special", key)
end

function CDOTABaseAbility:EndCooldown() end

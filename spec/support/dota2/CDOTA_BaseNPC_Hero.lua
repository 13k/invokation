local m = require("moses")
local class = require("pl.class")

local HeroKeyValues = require("invokation.dota2.kv.HeroKeyValues")

local LIMITS = require("invokation.const.limits")

-- selene: allow(incorrect_standard_library_use)
CDOTA_BaseNPC_Hero = class(CDOTA_BaseNPC)

local ATTRIBUTES = { hasInventory = true }
local DEFAULTS = { abilityPoints = 1, goldReliable = 0, goldUnreliable = 0 }

function CDOTA_BaseNPC_Hero:_init(attributes)
  attributes = m.extend({}, ATTRIBUTES, DEFAULTS, attributes or {})

  self:super(attributes)
  self.__attributes = attributes
end

function CDOTA_BaseNPC_Hero:HeroLevelUp(_playEffects)
  if self:GetLevel() == LIMITS.MAX_HERO_LEVEL then
    return
  end

  self:SetLevel(self:GetLevel() + 1)

  if self:GetLevel() == LIMITS.MAX_HERO_LEVEL then
    self:upgradeAllTalents()
  else
    self:SetAbilityPoints(self:GetAbilityPoints() + 1)
  end
end

function CDOTA_BaseNPC_Hero:GetGold()
  return self.goldReliable + self.goldUnreliable
end

function CDOTA_BaseNPC_Hero:SetGold(amount, isReliable)
  if isReliable then
    self.goldReliable = amount
  else
    self.goldUnreliable = amount
  end
end

function CDOTA_BaseNPC_Hero:ModifyGold(amount, isReliable, _reason)
  if isReliable then
    self.goldReliable = self.goldReliable + amount
  else
    self.goldUnreliable = self.goldUnreliable + amount
  end

  return self:GetGold()
end

function CDOTA_BaseNPC_Hero:GetAbilityPoints()
  return self.abilityPoints
end

function CDOTA_BaseNPC_Hero:SetAbilityPoints(points)
  self.abilityPoints = points
end

function CDOTA_BaseNPC_Hero:UpgradeAbility(ability)
  if self:GetAbilityPoints() > 0 then
    ability:UpgradeAbility(false)
    self:SetAbilityPoints(self:GetAbilityPoints() - 1)
  end
end

-- not part of Dota2's scripting API
function CDOTA_BaseNPC_Hero:upgradeAllTalents()
  local kv = HeroKeyValues(self:GetName(), self.__attributes)
  local talents = kv:Talents()

  for _, value in pairs(talents) do
    local ability = self:FindAbilityByName(value)

    if ability ~= nil then
      self:UpgradeAbility(ability)
    end
  end
end

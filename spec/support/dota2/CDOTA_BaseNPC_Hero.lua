local m = require("moses")
local class = require("pl.class")

CDOTA_BaseNPC_Hero = class(CDOTA_BaseNPC)

local ATTRIBUTES = {hasInventory = true}

local DEFAULTS = {abilityPoints = 1, goldReliable = 0, goldUnreliable = 0}

function CDOTA_BaseNPC_Hero:_init(attributes)
  attributes = m.chain({}):extend(ATTRIBUTES):extend(attributes):defaults(DEFAULTS):value()
  self:super(attributes)
end

function CDOTA_BaseNPC_Hero:HeroLevelUp(playEffects)
  self:SetLevel(self:GetLevel() + 1)
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

function CDOTA_BaseNPC_Hero:ModifyGold(amount, isReliable, reason)
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

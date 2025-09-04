local class = require("pl.class")
local m = require("moses")

local CDOTA_BaseNPC = require("support.dota2.CDOTA_BaseNPC")

local LIMITS = require("invk.const.limits")

--- @class support.dota2.CDOTA_BaseNPC_Hero : support.dota2.CDOTA_BaseNPC, CDOTA_BaseNPC_Hero
--- @field ability_points integer
--- @field gold_reliable integer
--- @field gold_unreliable integer
local CDOTA_BaseNPC_Hero = class(CDOTA_BaseNPC)

--- @class (partial) support.dota2.CDOTA_BaseNPC_Hero_attributes : support.dota2.CDOTA_BaseNPC_attributes
--- @field ability_points? integer
--- @field gold_reliable? integer
--- @field gold_unreliable? integer

--- @type support.dota2.CDOTA_BaseNPC_Hero_attributes
local ATTRIBUTES = {
  has_inventory = true,
  ability_points = 1,
  gold_reliable = 0,
  gold_unreliable = 0,
}

--- @param attributes support.dota2.CDOTA_BaseNPC_Hero_attributes
function CDOTA_BaseNPC_Hero:_init(attributes)
  self:super(m.extend({}, ATTRIBUTES, attributes))
end

function CDOTA_BaseNPC_Hero:HeroLevelUp(_playEffects)
  if self:GetLevel() == LIMITS.MAX_HERO_LEVEL then
    return
  end

  self:set_level(self:GetLevel() + 1)

  if self:GetLevel() == LIMITS.MAX_HERO_LEVEL then
    self:max_level()
  else
    self:SetAbilityPoints(self:GetAbilityPoints() + 1)
  end
end

function CDOTA_BaseNPC_Hero:GetGold()
  return self.gold_reliable + self.gold_unreliable
end

function CDOTA_BaseNPC_Hero:SetGold(amount, isReliable)
  if isReliable then
    self.gold_reliable = amount
  else
    self.gold_unreliable = amount
  end
end

function CDOTA_BaseNPC_Hero:ModifyGold(amount, isReliable, _reason)
  if isReliable then
    self.gold_reliable = self.gold_reliable + amount
  else
    self.gold_unreliable = self.gold_unreliable + amount
  end

  return self:GetGold()
end

function CDOTA_BaseNPC_Hero:GetAbilityPoints()
  return self.ability_points
end

function CDOTA_BaseNPC_Hero:SetAbilityPoints(points)
  self.ability_points = points
end

--- @param ability CDOTABaseAbility
function CDOTA_BaseNPC_Hero:UpgradeAbility(ability)
  if self:GetAbilityPoints() > 0 and ability:CanAbilityBeUpgraded() == ABILITY_CAN_BE_UPGRADED then
    ability:UpgradeAbility(false)
    self:SetAbilityPoints(self:GetAbilityPoints() - 1)
  end
end

-- not part of Dota2's scripting API
function CDOTA_BaseNPC_Hero:max_level()
  local extra_points = LIMITS.MAX_HERO_LEVEL - self:GetLevel() - 1

  if extra_points > 0 then
    self:SetAbilityPoints(self:GetAbilityPoints() + extra_points)
  end

  self:set_level(LIMITS.MAX_HERO_LEVEL)

  for i = 1, self:GetAbilityCount() do
    local ability = self:GetAbilityByIndex(i)

    if ability then
      while
        self:GetAbilityPoints() > 0
        and ability:CanAbilityBeUpgraded() == ABILITY_CAN_BE_UPGRADED
        and ability:GetLevel() < ability:GetMaxLevel()
      do
        self:UpgradeAbility(ability)
      end
    end
  end
end

return CDOTA_BaseNPC_Hero

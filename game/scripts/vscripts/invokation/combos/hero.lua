--- Internal combos hero helpers.
-- @module invokation.combos.hero

local M = {}

local Unit = require("invokation.dota2.Unit")
local Player = require("invokation.dota2.Player")
local Invoker = require("invokation.dota2.Invoker")

local UNITS = require("invokation.const.units")
local LIMITS = require("invokation.const.limits")
local SOUND_EVENTS = require("invokation.const.sound_events")

function M.setup(player, combo)
  player = Player(player)

  local unit = Unit(player.hero)

  unit:HeroLevelUpTo(combo.heroLevel)
  unit:AddItemsByName(combo.items or {}, {onlyMissing = true})

  if combo.gold ~= nil then
    unit:GiveGold(combo.gold)
  end

  unit:Hold()
end

function M.teardown(player, options)
  options = options or {}
  player = Player(player)

  local unit = Unit(player.hero)

  unit:StopSound(SOUND_EVENTS.SNDEVT_INVOKER_METEOR_LOOP)
  unit:EndItemCooldowns()
  unit:EndAbilityCooldowns()
  unit:RemoveDroppedItems()

  for _, unitName in pairs(UNITS.INVOKER_SPAWNED) do
    player:RemoveOwnedUnitsByName(unitName)
  end

  if options.hardReset then
    local invoker = Invoker(player.hero)

    unit:RemoveItems()
    -- Orbs reset must come before hero replacement
    invoker:ResetAbilities()
    unit:SetAbilityPoints(1)
    player:ReplaceHero(player.hero:GetUnitName())
  else
    unit:Purge()
    unit:GiveMaxHealth()
    unit:GiveMaxMana()
  end
end

function M.refundPurchase(player, purchase)
  player = Player(player)
  local unit = Unit(player.hero)
  unit:GiveGold(purchase.cost)
end

function M.levelUp(player, options)
  options = options or {}
  player = Player(player)

  local unit = Unit(player.hero)
  local targetLevel

  if options.level ~= nil then
    targetLevel = options.level
  elseif options.maxLevel then
    targetLevel = LIMITS.MAX_HERO_LEVEL
  else
    targetLevel = unit:GetLevel() + 1
  end

  unit:HeroLevelUpTo(targetLevel, {playEffects = true})

  if targetLevel == LIMITS.MAX_HERO_LEVEL then
    local invoker = Invoker(player.hero)
    invoker:LevelUpAbilities({maxLevel = true})
  end
end

return M

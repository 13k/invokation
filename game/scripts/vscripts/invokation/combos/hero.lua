--- Internal combos hero helpers.
-- @module invokation.combos.hero

local M = {}

local Unit = require("invokation.dota2.Unit")
local Player = require("invokation.dota2.Player")
local Invoker = require("invokation.dota2.Invoker")

function M.setup(player, combo)
  player = Player(player)

  local unit = Unit(player.hero)
  local invoker = Invoker(player.hero)
  local resetLevel = 1

  unit:RemoveItems({includeStash = true, endCooldown = true})
  -- Orbs reset must come before hero replacement
  invoker:ResetAbilities()
  player.hero:SetAbilityPoints(resetLevel)
  player:ReplaceHero(player.hero:GetUnitName())
  -- player.hero is a new instance referencing a new entity
  unit = Unit(player.hero)

  while unit:GetLevel() < combo.heroLevel do
    unit:HeroLevelUp(false)
  end

  unit:AddItemsByName(combo.items or {})
  unit:Hold()
end

return M

--- Internal combos hero helpers.
-- @module invokation.combos.hero

local M = {}

local Unit = require("invokation.dota2.Unit")
local UNITS = require("invokation.const.units")
local Player = require("invokation.dota2.Player")
local Invoker = require("invokation.dota2.Invoker")

function M.setup(player, combo)
  player = Player(player)

  local unit = Unit(player.hero)

  while unit:GetLevel() < combo.heroLevel do
    unit:HeroLevelUp(false)
  end

  unit:AddItemsByName(combo.items or {}, {onlyMissing = true})
  unit:Hold()
end

-- @todo always: remove player owned items on the ground
function M.teardown(player, options)
  options = options or {}
  player = Player(player)

  local unit = Unit(player.hero)

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
    player.hero:SetAbilityPoints(1)
    player:ReplaceHero(player.hero:GetUnitName())
  else
    unit:Purge()
    unit:GiveMaxHealth()
    unit:GiveMaxMana()
  end
end

return M

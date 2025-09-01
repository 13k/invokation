local Invoker = require("invk.dota2.invoker")
local LIMITS = require("invk.const.limits")
local Player = require("invk.dota2.player")
local SOUND_EVENTS = require("invk.const.sound_events")
local UNITS = require("invk.const.units")
local Unit = require("invk.dota2.unit")

--- Internal combos hero helpers.
--- @class invk.combos.hero
local M = {}

--- Runs the setup phase of a combo.
--- @param base_player CDOTAPlayerController # Player playing the combo
--- @param combo invk.combo.BaseCombo # Combo
function M.setup(base_player, combo)
  local player = Player:new(base_player)
  local unit = Unit:new(player.hero)

  unit:hero_level_up_to(combo.hero_level)
  unit:add_items_by_name(combo.items, { only_missing = true })

  if combo.gold ~= nil and combo.gold > 0 then
    unit:give_gold(combo.gold)
  end

  unit:hold()
end

--- @class invk.combo.hero.TeardownOptions
--- @field hard_reset boolean # Perform a full reset

--- Runs the teardown phase of a combo.
--- @param base_player CDOTAPlayerController # Player playing the combo
--- @param options? invk.combo.hero.TeardownOptions # Options table
function M.teardown(base_player, options)
  local opts = options or {}
  local player = Player:new(base_player)
  local unit = Unit:new(player.hero)

  unit:stop_sound(SOUND_EVENTS.SNDEVT_INVOKER_METEOR_LOOP)
  unit:end_item_cooldowns()
  unit:end_ability_cooldowns()
  unit:remove_dropped_items()

  for _, unit_name in pairs(UNITS.INVOKER_SPAWNED) do
    player:remove_owned_units_by_name(unit_name)
  end

  if opts.hard_reset then
    local invoker = Invoker:new(player.hero)

    unit:remove_items()
    -- Orbs reset must come before hero replacement
    invoker:reset_abilities()
    unit:set_ability_points(1)
    player:replace_hero(player.hero:GetUnitName())
  else
    unit:purge()
    unit:give_max_health()
    unit:give_max_mana()
  end
end

--- Purchase specification.
--- @class invk.combo.ItemPurchase
--- @field item string # Item name
--- @field cost integer # Purchase cost

--- Refunds a purchase made by a player's hero.
--- @param base_player CDOTAPlayerController # Player that made the purchase
--- @param purchase invk.combo.ItemPurchase # Purchase information
function M.refund_purchase(base_player, purchase)
  local player = Player:new(base_player)

  Unit:new(player.hero):give_gold(purchase.cost)
end

--- If no options are given, levels hero up one level.
--- @class invk.combo.LevelUpOptions
--- @field level? integer # Level up to specified level
--- @field max_level? boolean # Level up to max level (default: `false`)

--- Levels a player's hero up.
--- @param base_player CDOTAPlayerController # Player
--- @param options? invk.combo.LevelUpOptions
function M.level_up(base_player, options)
  local opts = options or {}
  local player = Player:new(base_player)
  local unit = Unit:new(player.hero)
  --- @type integer
  local target_level

  if opts.level ~= nil then
    target_level = opts.level
  elseif opts.max_level then
    target_level = LIMITS.MAX_HERO_LEVEL
  else
    target_level = unit:get_level() + 1
  end

  if target_level == LIMITS.MAX_HERO_LEVEL then
    HeroMaxLevel(player.hero)
  else
    unit:hero_level_up_to(target_level, { play_effects = true })
  end
end

return M

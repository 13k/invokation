local class = require("middleclass")

local ABILITY_LIST = require("invk.const.ability_list")
local BaseCombo = require("invk.combo.base_combo")
local Combo = require("invk.combo.combo")
local DummyTarget = require("invk.dota2.dummy_target")
local FreestyleCombo = require("invk.combo.freestyle_combo")
local Logger = require("invk.logger")
local Timers = require("invk.dota2.timers")
local combo_comms = require("invk.combo.communication")
local combo_hero = require("invk.combo.hero")
local combo_sound = require("invk.combo.sound")

local LOGNAME = "combos"

local ERRF_COMBO_NOT_FOUND = "Combo %q not found"
local ERRF_COMBO_NOT_ACTIVE = "Player %d has no active combo"
local WARNF_COMBO_NOT_FINISHED = "Combo %q can't be finished for player %d"

--- @class invk.combo.PlayerState
--- @field combo? invk.combo.BaseCombo
--- @field dummy? invk.dota2.DummyTarget
--- @field capturing? boolean

--- Combos manager.
--- @class invk.combo.Combos : middleclass.Class, invk.log.Mixin
--- @field specs { [invk.combo.ComboId]: invk.combo.ComboSpec }
--- @field state { [PlayerID]: invk.combo.PlayerState }
--- @field net_table invk.dota2.NetTable
--- @field logger? invk.Logger
local M = class("invk.combo.Combos")

M:include(Logger.Mixin)

--- @return { [invk.combo.ComboId]: invk.combo.ComboSpec }
local function load_specs()
  local raw_specs = require("invk.const.combos")
  local specs = {}

  for _, spec in ipairs(raw_specs) do
    specs[spec.id] = spec
  end

  return specs
end

local function game_time()
  return GameRules:GetGameTime()
end

--- @class invk.combo.CombosOptions
--- @field logger? invk.Logger # Logger instance

--- Constructor.
--- @param net_table invk.dota2.NetTable # NetTable instance
--- @param options? invk.combo.CombosOptions # Options table
function M:initialize(net_table, options)
  local opts = options or {}

  self.net_table = net_table
  self.state = {}

  if opts.logger then
    self.logger = opts.logger:child(LOGNAME)
  end

  self:load()
end

function M:load()
  self:d("Loading")

  self.specs = load_specs()

  self.net_table:set(self.net_table.keys.COMBOS, self.specs)
end

--- @param id invk.combo.ComboId
--- @return invk.combo.BaseCombo
function M:create(id)
  if id == BaseCombo.FREESTYLE_COMBO_ID then
    return FreestyleCombo:new({ logger = self.logger })
  end

  local spec = self.specs[id]

  if spec == nil then
    errorf(ERRF_COMBO_NOT_FOUND, id)
  end

  return Combo:new(spec, { logger = self.logger, clock = game_time })
end

--- @private
--- @param player CDOTAPlayerController
--- @return invk.combo.PlayerState
function M:player_state(player)
  local id = player:GetPlayerID()

  if self.state[id] == nil then
    self.state[id] = {}
  end

  return self.state[id]
end

--- @private
--- @param player CDOTAPlayerController
--- @return invk.combo.BaseCombo
function M:require_combo(player)
  local combo = self:player_state(player).combo

  if combo == nil then
    errorf(ERRF_COMBO_NOT_ACTIVE, player:GetPlayerID())
  end

  return combo
end

--- @private
--- @param player CDOTAPlayerController
--- @param combo invk.combo.BaseCombo
function M:setup(player, combo)
  local state = self:player_state(player)

  state.combo = combo

  combo_hero.setup(player, combo)

  if state.dummy == nil then
    state.dummy = DummyTarget:new()

    combo_sound.on_dummy_create(state.dummy)
  end

  state.dummy:spawn()
end

--- @private
--- @param player CDOTAPlayerController
--- @param options? invk.combo.hero.TeardownOptions
function M:teardown(player, options)
  local state = self:player_state(player)

  state.combo = nil

  combo_hero.teardown(player, options)

  if state.dummy ~= nil then
    state.dummy:kill()
  end
end

--- @private
--- @param player CDOTAPlayerController
--- @param combo invk.combo.Combo
function M:start(player, combo)
  self:setup(player, combo)

  combo_sound.on_combo_start(player)
  combo_comms.send_started(player, combo)
end

--- @private
--- @param player CDOTAPlayerController
--- @param combo invk.combo.Combo
function M:stop(player, combo)
  self:teardown(player, { hard_reset = true })

  combo_sound.on_combo_stop(player)
  combo_comms.send_stopped(player, combo)
end

--- Handles ability usage.
--- @param player CDOTAPlayerController # Player instance
--- @param unit invk.dota2.Unit # Unit instance
--- @param ability invk.dota2.Ability # Ability instance
function M:on_ability_used(player, unit, ability)
  if ABILITY_LIST:is_ignored(ability) then
    return
  end

  self:d("on_ability_used", {
    player = player:GetPlayerID(),
    unit = unit.name,
    ability = ability.name,
  })

  self:capture_ability(player, ability)
  self:on_progress(player, ability)
end

--- Handles damage instances being dealt to entities.
--- @param damage invk.dota2.DamageInstance # DamageInstance instance
function M:on_entity_hurt(damage)
  local player = damage:attacker_player_owner()

  if player == nil then
    return
  end

  self:d("on_entity_hurt", {
    category = damage.category,
    amount = damage.amount,
    victim = damage:victim_name(),
    attacker = damage:attacker_name(),
    inflictor = damage:inflictor_name(),
  })

  self:on_progress_damage(player, damage)
end

--- Handles item purchases.
--- @param player CDOTAPlayerController # Player instance
--- @param purchase invk.combo.ItemPurchase # Purchase information
function M:on_item_purchased(player, purchase)
  local state = self:player_state(player)

  if not state.combo or not state.combo:is_freestyle() then
    return
  end

  self:d("on_item_purchased", {
    player = player:GetPlayerID(),
    purchase = purchase,
  })

  combo_hero.refund_purchase(player, purchase)
end

--- Starts a combo for the given player.
--- @param player CDOTAPlayerController # Player instance
--- @param combo invk.combo.Combo # Combo
function M:on_start(player, combo)
  self:d("on_start", {
    player = player:GetPlayerID(),
    id = combo.id,
  })

  local state = self:player_state(player)
  local current = state.combo

  if current ~= nil and current.id ~= combo.id then
    self:stop(player, current)
  else
    self:teardown(player, { hard_reset = current == nil })
  end

  self:start(player, combo)
end

--- Stops currently active combo for the given player.
--- @param player CDOTAPlayerController # Player instance
function M:on_stop(player)
  self:d("on_stop", { player = player:GetPlayerID() })

  local combo = self:require_combo(player)

  self:stop(player, combo)
end

--- Restarts a combo for the given player.
--- @param player CDOTAPlayerController # Player instance
--- @param options? invk.combo.hero.TeardownOptions # Options table
function M:on_restart(player, options)
  self:d("on_restart", {
    player = player:GetPlayerID(),
    options = options,
  })

  local combo = self:require_combo(player)

  self:teardown(player, options)

  combo = self:create(combo.id)

  self:start(player, combo)
end

--- Progresses the currently active combo for the given player.
--- @param player CDOTAPlayerController # Player instance
--- @param ability invk.dota2.Ability # Ability instance
function M:on_progress(player, ability)
  local combo = self:player_state(player).combo

  if not combo then
    return
  end

  if not combo:is_progressing_abilities() then
    return
  end

  self:d("on_progress", {
    player = player:GetPlayerID(),
    ability = ability.name,
  })

  if combo:progress(ability) then
    if combo.metrics.count == 1 then
      combo_comms.send_in_progress(player, combo)
    end

    combo_comms.send_progress(player, combo)

    if combo:pre_finish() then
      self:on_pre_finish(player)
    end
  elseif not ability:is_invocation_ability() then
    self:on_fail(player, ability)
  end
end

--- Increments the damage amount of the currently active combo for the given player.
--- @param player CDOTAPlayerController # Player instance
--- @param damage invk.dota2.DamageInstance # DamageInstance instance
function M:on_progress_damage(player, damage)
  local combo = self:player_state(player).combo

  if not combo then
    return
  end

  if not combo:is_progressing_damage() then
    return
  end

  self:d("on_progress_damage", {
    player = player:GetPlayerID(),
    category = damage.category,
    amount = damage.amount,
    victim = damage:victim_name(),
    attacker = damage:attacker_name(),
    inflictor = damage:inflictor_name(),
  })

  --- @fixme Only increment damage coming from currently active spells (including forged spirits)
  --- or autoattacks
  combo:increment_damage(damage.amount)
  combo_comms.send_progress(player, combo)
end

--- Fails and stops currently active combo for the given player.
--- @param player CDOTAPlayerController # Player instance
--- @param ability invk.dota2.Ability # Ability instance
function M:on_fail(player, ability)
  self:d("on_fail", { player = player:GetPlayerID() })

  local combo = self:require_combo(player)

  combo:fail()

  combo_sound.on_combo_step_error(player)
  combo_comms.send_step_error(player, combo, ability)
end

--- Preemptively finishes a combo for the given player.
--- @param player CDOTAPlayerController # Player instance
function M:on_pre_finish(player)
  self:d("on_pre_finish", { player = player:GetPlayerID() })

  --- @type invk.combo.Combo
  local combo = self:require_combo(player)

  combo_comms.send_pre_finish(player, combo)

  local this = self

  Timers:create({
    delay = combo.wait.duration,
    callback = function()
      this:on_finish(player)
    end,
  })
end

--- Finishes a combo for the given player.
--- @param player CDOTAPlayerController # Player instance
function M:on_finish(player)
  self:d("on_finish", { player = player:GetPlayerID() })

  local combo = self:require_combo(player)

  if not combo:finish() then
    self:warnf(WARNF_COMBO_NOT_FINISHED, combo.id, player:GetPlayerID())
    return
  end

  self:d("finished", {
    id = combo.id,
    now = game_time(),
  })

  combo_sound.on_combo_finished(player)
  combo_comms.send_finished(player, combo)
end

--- Starts capturing ability usage for the given player.
--- @param player CDOTAPlayerController # Player instance
function M:start_capturing_abilities(player)
  self:d("start_capturing_abilities", { player = player:GetPlayerID() })
  self:player_state(player).capturing = true
end

--- Stops capturing ability usage for the given player.
--- @param player CDOTAPlayerController # Player instance
function M:stop_capturing_abilities(player)
  self:d("stop_capturing_abilities", { player = player:GetPlayerID() })
  self:player_state(player).capturing = nil
end

--- Captures an instance of ability usage for the given player.
--- @param player CDOTAPlayerController # Player instance
--- @param ability invk.dota2.Ability # Ability instance
function M:capture_ability(player, ability)
  if self:player_state(player).capturing then
    combo_comms.send_ability_used(player, ability)
  end
end

--- Handles freestyle hero level up.
--- @param player CDOTAPlayerController # Player instance
--- @param options? invk.combo.LevelUpOptions
function M:freestyle_hero_level_up(player, options)
  local combo = self:player_state(player).combo

  if not combo then
    return
  end

  if not combo:is_freestyle() then
    return
  end

  self:d("freestyle_hero_level_up", {
    player = player:GetPlayerID(),
    options = options,
  })

  combo_hero.level_up(player, options)
end

return M

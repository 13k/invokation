--- Combos manager.
-- @classmod invokation.combos.Combos

local M = require("pl.class")()

local Combo = require("invokation.combos.Combo")
local CombosHero = require("invokation.combos.hero")
local CombosComm = require("invokation.combos.communication")
local CombosSound = require("invokation.combos.sound")
local DummyTarget = require("invokation.dota2.DummyTarget")
local ABILITY_LIST = require("invokation.const.ability_list")

local NET_TABLE_KEY = "combos"

local function loadSpecs()
  local specs = require("invokation.const.combos")

  for id, spec in pairs(specs) do
    spec.id = id

    for stepId, step in pairs(spec.sequence) do
      step.id = stepId
    end
  end

  return specs
end

local function isIgnoredAbility(ability)
  local switch = ABILITY_LIST[ability.name]

  if switch == nil then
    return false
  end

  return not ABILITY_LIST[ability.name]
end

--- Constructor.
-- @tparam table options Options table
-- @tparam invokation.Logger options.logger Logger instance
-- @tparam invokation.dota2.NetTable options.netTable NetTable instance
function M:_init(options)
  self.logger = options.logger
  self.netTable = options.netTable
  self.combos = {}
  self.players = {}
  self:load()
end

function M:d(...)
  return self.logger:Debug(...)
end

function M:err(...)
  return self.logger:Error(...)
end

function M:errf(...)
  return self.logger:Errorf(...)
end

function M:load()
  self:d("loading combos")
  self.specs = loadSpecs()
  self.netTable:Set(NET_TABLE_KEY, self.specs)
end

function M:playerState(player)
  local playerID = player:GetPlayerID()

  if self.players[playerID] == nil then
    self.players[playerID] = {}
  end

  return self.players[playerID]
end

function M:setPlayerState(player, key, value)
  self:playerState(player)[key] = value
  return value
end

function M:getPlayerState(player, key, default)
  local value = self:playerState(player)[key]
  -- Explicit nil check to avoid returning the default when value is boolean `false`
  return value == nil and default or value
end

function M:createCombo(comboID)
  local spec = self.specs[comboID]

  if spec == nil then
    return nil
  end

  return Combo(spec)
end

function M:setup(player, combo)
  self:setPlayerState(player, "combo", combo)

  CombosHero.setup(player, combo)

  local dummy = self:getPlayerState(player, "dummy")

  if dummy == nil then
    dummy = self:setPlayerState(player, "dummy", DummyTarget())
    CombosSound.onDummyCreate(dummy)
  end

  dummy:Spawn()
end

function M:teardown(player, options)
  self:setPlayerState(player, "combo", nil)

  CombosHero.teardown(player, options)

  local dummy = self:getPlayerState(player, "dummy")

  if dummy ~= nil then
    dummy:Kill()
  end
end

--- Starts a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam string comboID Combo ID
function M:Start(player, comboID)
  self:d("Combos:Start()", player:GetPlayerID(), comboID)

  local combo = self:getPlayerState(player, "combo")

  if combo ~= nil then
    self:teardown(player, {hardReset = true})
  end

  combo = self:createCombo(comboID)

  if combo == nil then
    self:errf("Could not find combo %q", comboID)
    return
  end

  self:setup(player, combo)

  CombosSound.onComboStart(player)
  CombosComm.sendStarted(player, combo)
end

--- Restarts a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam table options Options table
-- @tparam[opt=false] bool options.hardReset Hard reset
function M:Restart(player, options)
  self:d("Combos:Restart()", player:GetPlayerID())

  local combo = self:getPlayerState(player, "combo")

  if combo == nil then
    self:errf("Player %d has no active combo", player:GetPlayerID())
    return
  end

  self:teardown(player, options)
  self:Start(player, combo.id)
end

--- Stops currently active combo for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:Stop(player)
  self:d("Combos:Stop()", player:GetPlayerID())

  local combo = self:getPlayerState(player, "combo")

  if combo == nil then
    self:errf("Player %d has no active combo", player:GetPlayerID())
    return
  end

  self:teardown(player, {hardReset = true})

  CombosSound.onComboStop(player)
  CombosComm.sendStopped(player, combo)
end

--- Finishes a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:Finish(player)
  self:d("Combos:Finish()", player:GetPlayerID())

  local combo = self:getPlayerState(player, "combo")

  if combo == nil then
    self:errf("Player %d has no active combo", player:GetPlayerID())
    return
  end

  CombosSound.onComboFinished(player)
  CombosComm.sendFinished(player, combo)
end

--- Starts capturing ability usage for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:StartCapturingAbilities(player)
  self:d("Combos:StartCapturingAbilities()", player:GetPlayerID())
  self:setPlayerState(player, "capturing", true)
end

--- Stops capturing ability usage for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:StopCapturingAbilities(player)
  self:d("Combos:StopCapturingAbilities()", player:GetPlayerID())
  self:setPlayerState(player, "capturing", nil)
end

--- Handles ability usage.
-- @tparam CDOTAPlayer player Player instance
-- @tparam invokation.dota2.Unit unit Unit instance
-- @tparam invokation.dota2.Ability ability Ability instance
-- @todo Implement wait/delay steps
function M:OnAbilityUsed(player, unit, ability)
  self:d("Combos:OnAbilityUsed()", player:GetPlayerID(), unit.name, ability.name)

  if isIgnoredAbility(ability) then
    return
  end

  if self:getPlayerState(player, "capturing") then
    CombosComm.sendAbilityUsed(player, ability)
  end

  local combo = self:getPlayerState(player, "combo")

  if combo == nil then
    return
  end

  if combo:Progress(ability) then
    CombosComm.sendProgress(player, combo)

    if combo:Finish() then
      self:Finish(player)
    end
  elseif not ability:IsInvocationAbility() then
    CombosComm.sendStepError(player, combo, ability)
  end
end

--- Handles damage instances being dealt to entities.
-- @tparam invokation.dota2.DamageInstance damage DamageInstance instance
function M:OnEntityHurt(damage)
  self:d("Combos:OnEntityHurt()")
  self:d("  category:", damage.category)
  self:d("  damage:", damage.amount)
  self:d("  victim:", damage:VictimName())
  self:d("  attacker:", damage:AttackerName())
  self:d("  inflictor:", damage:InflictorName())

  local player = damage:AttackerPlayerOwner()

  if player == nil then
    return
  end

  local combo = self:getPlayerState(player, "combo")

  if combo == nil then
    return
  end

  combo:IncrementDamage(damage.amount)
end

return M

--- Combos manager.
-- @classmod invokation.combos.Combos

local Combo = require("invokation.combos.Combo")
local Logger = require("invokation.Logger")
local Timers = require("invokation.dota2.timers")
local CombosHero = require("invokation.combos.hero")
local CombosComm = require("invokation.combos.communication")
local CombosSound = require("invokation.combos.sound")
local DummyTarget = require("invokation.dota2.DummyTarget")
local PlayerStates = require("invokation.combos.PlayerStates")
local FreestyleCombo = require("invokation.combos.FreestyleCombo")
local NET_TABLE = require("invokation.const.net_table")
local ABILITY_LIST = require("invokation.const.ability_list")

local M = require("pl.class")()

local LOGGER_PROGNAME = "combos"

Logger.InstallHelpers(M)

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

local function isRunningCombo(combo)
  return combo ~= nil and not combo.failed
end

local function isFreestyleCombo(combo)
  return combo ~= nil and combo.id == FreestyleCombo.COMBO_ID
end

--- Constructor.
-- @tparam table options Options table
-- @tparam invokation.Logger options.logger Logger instance
-- @tparam invokation.dota2.NetTable options.netTable NetTable instance
function M:_init(options)
  self.logger = options.logger:Child(LOGGER_PROGNAME)
  self.netTable = options.netTable
  self.combos = {}
  self.state = PlayerStates()
  self:load()
end

function M:load()
  self:d("Loading")
  self.specs = loadSpecs()
  self.netTable:Set(NET_TABLE.MAIN_KEYS.COMBOS, self.specs)
end

function M:createCombo(comboId)
  if comboId == FreestyleCombo.COMBO_ID then
    return FreestyleCombo({logger = self.logger})
  end

  local spec = self.specs[comboId]

  if spec == nil then
    return nil
  end

  return Combo(spec, {logger = self.logger})
end

function M:setup(player, combo)
  self.state[player].combo = combo

  CombosHero.setup(player, combo)

  local dummy = self.state[player].dummy

  if dummy == nil then
    dummy = DummyTarget()
    self.state[player].dummy = dummy
    CombosSound.onDummyCreate(dummy)
  end

  dummy:Spawn()
end

function M:teardown(player, options)
  self.state[player].combo = nil

  CombosHero.teardown(player, options)

  local dummy = self.state[player].dummy

  if dummy ~= nil then
    dummy:Kill()
  end
end

--- Starts a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam string comboId Combo ID
function M:Start(player, comboId)
  self:d("Start()", {player = player:GetPlayerID(), combo = comboId})

  local combo = self.state[player].combo

  if combo ~= nil then
    self:teardown(player, {hardReset = true})
  end

  combo = self:createCombo(comboId)

  if combo == nil then
    self:errf("Could not find combo %q", comboId)
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
  self:d("Restart()", {player = player:GetPlayerID()})

  local combo = self.state[player].combo

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
  self:d("Stop()", {player = player:GetPlayerID()})

  local combo = self.state[player].combo

  if combo == nil then
    self:errf("Player %d has no active combo", player:GetPlayerID())
    return
  end

  self:teardown(player, {hardReset = true})

  CombosSound.onComboStop(player)
  CombosComm.sendStopped(player, combo)
end

--- Progresses the currently active combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam invokation.dota2.Ability ability Ability instance
function M:Progress(player, ability)
  self:d("Progress()", {player = player:GetPlayerID(), ability = ability.name})

  local combo = self.state[player].combo

  if not isRunningCombo(combo) then
    self:d("  ignored")
    return
  end

  if combo:Progress(ability) then
    if combo.count == 1 then
      self:d("  in progress")
      CombosComm.sendInProgress(player, combo)
    end

    CombosComm.sendProgress(player, combo)

    self:d("  progressed")

    if combo:Finish() then
      self:Finish(player)
    end
  elseif not ability:IsInvocationAbility() then
    self:Fail(player, ability)
  end
end

--- Increments the damage amount of the currently active combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam invokation.dota2.DamageInstance damage DamageInstance instance
function M:ProgressDamage(player, damage)
  self:d("ProgressDamage()", {player = player:GetPlayerID()})

  local combo = self.state[player].combo

  if not isRunningCombo(combo) then
    self:d("  ignored")
    return
  end

  combo:IncrementDamage(damage.amount)
  CombosComm.sendProgress(player, combo)
end

--- Fails and stops currently active combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam invokation.dota2.Ability ability Ability instance
function M:Fail(player, ability)
  self:d("Fail()", {player = player:GetPlayerID()})

  local combo = self.state[player].combo

  if combo == nil then
    self:errf("Player %d has no active combo", player:GetPlayerID())
    return
  end

  combo:Fail()
  CombosSound.onComboStepError(player)
  CombosComm.sendStepError(player, combo, ability)
end

--- Finishes a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:Finish(player)
  self:d("Finish()", {player = player:GetPlayerID()})

  local combo = self.state[player].combo

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
  self:d("StartCapturingAbilities()", {player = player:GetPlayerID()})
  self.state[player].capturing = true
end

--- Stops capturing ability usage for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:StopCapturingAbilities(player)
  self:d("StopCapturingAbilities()", {player = player:GetPlayerID()})
  self.state[player].capturing = nil
end

--- Handles ability usage.
-- @tparam CDOTAPlayer player Player instance
-- @tparam invokation.dota2.Unit unit Unit instance
-- @tparam invokation.dota2.Ability ability Ability instance
function M:OnAbilityUsed(player, unit, ability)
  self:d(
    "OnAbilityUsed()",
    {player = player:GetPlayerID(), unit = unit.name, ability = ability.name}
  )

  if isIgnoredAbility(ability) then
    self:d("  ignored")
    return
  end

  if self.state[player].capturing then
    self:d("  captured")
    CombosComm.sendAbilityUsed(player, ability)
  end

  self:Progress(player, ability)
end

--- Handles damage instances being dealt to entities.
-- @tparam invokation.dota2.DamageInstance damage DamageInstance instance
function M:OnEntityHurt(damage)
  self:d(
    "OnEntityHurt()",
    {
      category = damage.category,
      amount = damage.amount,
      victim = damage:VictimName(),
      attacker = damage:AttackerName(),
      inflictor = damage:InflictorName()
    }
  )

  local player = damage:AttackerPlayerOwner()

  if player == nil then
    self:d("  ignored")
    return
  end

  self:ProgressDamage(player, damage)
end

--- Handles item purchases.
-- @tparam CDOTAPlayer player Player instance
-- @tparam table purchase Purchase information
-- @tparam string purchase.item Item name
-- @tparam number purchase.cost Item cost
function M:OnItemPurchased(player, purchase)
  self:d("OnItemPurchased()", {player = player:GetPlayerID(), purchase = purchase})

  local combo = self.state[player].combo

  if not isFreestyleCombo(combo) then
    self:d("  ignored")
    return
  end

  CombosHero.refundPurchase(player, purchase)
end

--- Handles freestyle hero level up.
--
-- If no options are given, levels hero up one level.
--
-- @tparam CDOTAPlayer player Player instance
-- @tparam table options Options table
-- @tparam[opt] int options.level Level up to specified level
-- @tparam[opt=false] bool options.maxLevel Level up to max level
function M:FreestyleHeroLevelUp(player, options)
  self:d("FreestyleHeroLevelUp()", {player = player:GetPlayerID(), options = options})

  local combo = self.state[player].combo

  if not isFreestyleCombo(combo) then
    self:d("  ignored")
    return
  end

  CombosHero.levelUp(player, options)
end

return M

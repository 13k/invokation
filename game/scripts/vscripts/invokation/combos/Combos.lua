--- Combos manager.
-- @classmod invokation.combos.Combos

local class = require("pl.class")
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

local M = class()

local LOGGER_PROGNAME = "combos"

local ERRF_COMBO_NOT_FOUND = "Combo %q not found"
local ERRF_COMBO_NOT_ACTIVE = "Player %d has no active combo"
local WARNF_COMBO_NOT_FINISHED = "Combo %q can't be finished for player %d"

Logger.Extend(M)

--- Purchase specification.
-- @table Purchase
-- @tfield string item Item name
-- @tfield number cost Purchase cost

--- Level up options specification.
--
-- If no options are given, levels hero up one level.
--
-- @table LevelUpOptions
-- @tfield[opt] int level Level up to specified level
-- @tfield[opt=false] bool maxLevel Level up to max level

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

local function isProgressingAbilities(combo)
  return combo and not combo.failed and not combo.preFinished
end

local function isProgressingDamage(combo)
  return combo and combo.started and not combo.failed and not combo.finished
end

local function isFreestyle(combo)
  return (combo and combo.id) == FreestyleCombo.COMBO_ID
end

local function gameTime()
  return GameRules:GetGameTime()
end

--- Constructor.
-- @tparam table options Options table
-- @tparam Logger options.logger Logger instance
-- @tparam dota2.NetTable options.netTable NetTable instance
function M:_init(options)
  self.netTable = options.netTable
  self.state = PlayerStates()

  if options.logger then
    self.logger = options.logger:Child(LOGGER_PROGNAME)
  end

  self:load()
end

function M:load()
  self:d("Loading")
  self.specs = loadSpecs()
  self.netTable:Set(NET_TABLE.MAIN_KEYS.COMBOS, self.specs)
end

function M:Create(id)
  if id == FreestyleCombo.COMBO_ID then
    return FreestyleCombo({ logger = self.logger })
  end

  local spec = self.specs[id]

  if spec == nil then
    local err = ERRF_COMBO_NOT_FOUND:format(id)
    self:err(err)
    error(err)
  end

  return Combo(spec, {
    logger = self.logger,
    clock = gameTime,
  })
end

function M:requireCombo(player)
  local combo = self.state[player].combo

  if combo == nil then
    local err = ERRF_COMBO_NOT_ACTIVE:format(player:GetPlayerID())
    self:err(err)
    error(err)
  end

  return combo
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
  options = options or {}

  self.state[player].combo = nil

  CombosHero.teardown(player, options)

  local dummy = self.state[player].dummy

  if dummy ~= nil then
    dummy:Kill()
  end
end

function M:start(player, combo)
  self:setup(player, combo)

  CombosSound.onComboStart(player)
  CombosComm.sendStarted(player, combo)
end

function M:stop(player, combo)
  self:teardown(player, { hardReset = true })

  CombosSound.onComboStop(player)
  CombosComm.sendStopped(player, combo)
end

--- Handles ability usage.
-- @tparam CDOTAPlayer player Player instance
-- @tparam dota2.Unit unit Unit instance
-- @tparam dota2.Ability ability Ability instance
function M:OnAbilityUsed(player, unit, ability)
  if isIgnoredAbility(ability) then
    self:d("OnAbilityUsed [ignored]", {
      player = player:GetPlayerID(),
      unit = unit.name,
      ability = ability.name,
    })

    return
  end

  self:d("OnAbilityUsed", {
    player = player:GetPlayerID(),
    unit = unit.name,
    ability = ability.name,
  })

  self:CaptureAbility(player, ability)
  self:Progress(player, ability)
end

--- Handles damage instances being dealt to entities.
-- @tparam dota2.DamageInstance damage DamageInstance instance
function M:OnEntityHurt(damage)
  local player = damage:AttackerPlayerOwner()

  if player == nil then
    self:d("OnEntityHurt [ignored]", {
      category = damage.category,
      amount = damage.amount,
    })

    return
  end

  self:d("OnEntityHurt", {
    category = damage.category,
    amount = damage.amount,
    victim = damage:VictimName(),
    attacker = damage:AttackerName(),
    inflictor = damage:InflictorName(),
  })

  self:ProgressDamage(player, damage)
end

--- Handles item purchases.
-- @tparam CDOTAPlayer player Player instance
-- @tparam Purchase purchase Purchase information
function M:OnItemPurchased(player, purchase)
  local combo = self.state[player].combo

  if not isFreestyle(combo) then
    self:d("OnItemPurchased [ignored]", {
      player = player:GetPlayerID(),
      purchase = purchase,
    })

    return
  end

  self:d("OnItemPurchased", {
    player = player:GetPlayerID(),
    purchase = purchase,
  })

  CombosHero.refundPurchase(player, purchase)
end

--- Starts a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam Combo combo Combo
function M:Start(player, combo)
  self:d("Start", {
    player = player:GetPlayerID(),
    id = id,
  })

  local current = self.state[player].combo

  if current ~= nil and current.id ~= combo.id then
    self:stop(player, current)
  else
    self:teardown(player, { hardReset = current == nil })
  end

  self:start(player, combo)
end

--- Stops currently active combo for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:Stop(player)
  self:d("Stop", { player = player:GetPlayerID() })

  local combo = self:requireCombo(player)

  self:stop(player, combo)
end

--- Restarts a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam table options Options table
-- @tparam[opt=false] bool options.hardReset Hard reset
function M:Restart(player, options)
  self:d("Restart", {
    player = player:GetPlayerID(),
    options = options,
  })

  local combo = self:requireCombo(player)

  self:teardown(player, options)

  combo = self:Create(combo.id)

  self:start(player, combo)
end

--- Progresses the currently active combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam dota2.Ability ability Ability instance
function M:Progress(player, ability)
  local combo = self.state[player].combo

  if not isProgressingAbilities(combo) then
    self:d("Progress [ignored]", {
      player = player:GetPlayerID(),
      ability = ability.name,
    })

    return
  end

  self:d("Progress", {
    player = player:GetPlayerID(),
    ability = ability.name,
  })

  if combo:Progress(ability) then
    if combo.count == 1 then
      CombosComm.sendInProgress(player, combo)
    end

    CombosComm.sendProgress(player, combo)

    if combo:PreFinish() then
      self:PreFinish(player)
    end
  elseif not ability:IsInvocationAbility() then
    self:Fail(player, ability)
  end
end

--- Increments the damage amount of the currently active combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam dota2.DamageInstance damage DamageInstance instance
function M:ProgressDamage(player, damage)
  local combo = self.state[player].combo

  if not isProgressingDamage(combo) then
    self:d("ProgressDamage [ignored]", {
      player = player:GetPlayerID(),
      category = damage.category,
      amount = damage.amount,
    })

    return
  end

  self:d("ProgressDamage", {
    player = player:GetPlayerID(),
    category = damage.category,
    amount = damage.amount,
    victim = damage:VictimName(),
    attacker = damage:AttackerName(),
    inflictor = damage:InflictorName(),
  })

  -- @fixme Only increment damage coming from currently active spells (including
  -- forged spirits) or autoattacks
  combo:IncrementDamage(damage.amount)
  CombosComm.sendProgress(player, combo)
end

--- Fails and stops currently active combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam dota2.Ability ability Ability instance
function M:Fail(player, ability)
  self:d("Fail", { player = player:GetPlayerID() })

  local combo = self:requireCombo(player)

  combo:Fail()

  CombosSound.onComboStepError(player)
  CombosComm.sendStepError(player, combo, ability)
end

--- Preemptively finishes a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:PreFinish(player)
  self:d("PreFinish", { player = player:GetPlayerID() })

  local combo = self:requireCombo(player)

  CombosComm.sendPreFinish(player, combo)

  Timers:Create({
    delay = combo.waitDuration,
    callback = self.Finish,
    args = { self, player },
  })
end

--- Finishes a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:Finish(player)
  self:d("Finish", { player = player:GetPlayerID() })

  local combo = self:requireCombo(player)

  if not combo:Finish() then
    self:warnf(WARNF_COMBO_NOT_FINISHED, combo.id, player:GetPlayerID())
    return
  end

  self:d("Finished", {
    id = combo.id,
    now = gameTime(),
  })

  CombosSound.onComboFinished(player)
  CombosComm.sendFinished(player, combo)
end

--- Starts capturing ability usage for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:StartCapturingAbilities(player)
  self:d("StartCapturingAbilities", { player = player:GetPlayerID() })
  self.state[player].capturing = true
end

--- Stops capturing ability usage for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:StopCapturingAbilities(player)
  self:d("StopCapturingAbilities", { player = player:GetPlayerID() })
  self.state[player].capturing = nil
end

--- Captures an instance of ability usage for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam dota2.Ability ability Ability instance
function M:CaptureAbility(player, ability)
  if self.state[player].capturing then
    CombosComm.sendAbilityUsed(player, ability)
  end
end

--- Handles freestyle hero level up.
-- @tparam CDOTAPlayer player Player instance
-- @tparam LevelUpOptions options
function M:FreestyleHeroLevelUp(player, options)
  local combo = self.state[player].combo

  if not isFreestyle(combo) then
    self:d("FreestyleHeroLevelUp [ignored]", {
      player = player:GetPlayerID(),
      options = options,
    })
    return
  end

  self:d("FreestyleHeroLevelUp", {
    player = player:GetPlayerID(),
    options = options,
  })

  CombosHero.levelUp(player, options)
end

return M

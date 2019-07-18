--- Combos manager.
-- @classmod invokation.combos.Combos
-- @todo Use combo IDs instead of names

local M = require("pl.class")()

local Combo = require("invokation.combos.Combo")
local COMBOS = require("invokation.const.combos")
local CombosHero = require("invokation.combos.hero")
local CombosComm = require("invokation.combos.communication")
local CombosSound = require("invokation.combos.sound")
local DummyTarget = require("invokation.dota2.DummyTarget")

local NET_TABLE_KEY = "combos"

--- Constructor.
-- @tparam table options Options table
-- @tparam invokation.Logger options.logger Logger instance
-- @tparam invokation.dota2.NetTable options.netTable NetTable instance
function M:_init(options)
  self.logger = options.logger
  self.netTable = options.netTable
  self.combos = {}
  self.players = {}
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

--- Loads combo definitions.
--
-- It should be called in the `Precache()` function.
function M:Load()
  self:d("Combos:Load() - loading combos")

  self.combos = {}
  self.combosByName = {}

  for name, spec in pairs(COMBOS) do
    spec.id = "invokation_combo_" .. name
    spec.name = name

    for id, step in pairs(spec.sequence) do
      step.id = id
    end

    local combo = Combo(spec)

    table.insert(self.combos, combo)
    self.combosByName[name] = combo
  end

  self.netTable:Set(NET_TABLE_KEY, COMBOS)

  self:d("Combos:Load() - finished loading combos")
end

--- Finds a combo by name.
-- @tparam string name Combo name
-- @treturn invokation.combos.Combo|nil Combo instance if found, `nil` otherwise
function M:Find(name)
  return self.combosByName[name]
end

--- Starts a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam invokation.combos.Combo combo Combo instance
-- @todo implement countdown
-- @todo implement completion timer comparing against ideal time
function M:Start(player, combo)
  self:d("Combos:Start()", player:GetPlayerID(), combo.name)

  if not combo:Reset() then
    self:errf("Could not reset combo '%s' for player %d", combo.name, player:GetPlayerID())
    return
  end

  self:setPlayerState(player, "combo", combo)
  self:setPlayerState(player, "damage", 0)

  local dummy = self:getPlayerState(player, "dummy")

  if dummy == nil then
    dummy = self:setPlayerState(player, "dummy", DummyTarget())
    CombosSound.onDummyCreate(dummy)
  end

  dummy:Reset()
  CombosHero.setup(player, combo)
  CombosSound.onComboStart(player)
  CombosComm.sendStarted(player, combo)
end

--- Restarts a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam invokation.combos.Combo combo Combo instance
function M:Restart(player, combo)
  self:d("Combos:Restart()", player:GetPlayerID(), combo.name)
  return self:Start(player, combo)
end

--- Stops currently active combo for the given player.
-- @tparam CDOTAPlayer player Player instance
function M:Stop(player)
  self:d("Combos:Stop()", player:GetPlayerID())

  local combo = self:getPlayerState(player, "combo")

  if combo == nil then
    return
  end

  self:getPlayerState(player, "dummy"):Kill()
  self:setPlayerState(player, "combo", nil)

  CombosSound.onComboStop(player)
  CombosComm.sendStopped(player)
end

--- Finishes a combo for the given player.
-- @tparam CDOTAPlayer player Player instance
-- @tparam invokation.combos.Combo combo Combo instance
function M:Finish(player, combo)
  self:d("Combos:Finish()", player:GetPlayerID(), combo.name)

  local hero = player:GetAssignedHero()

  hero:PerformTaunt()
  CombosSound.onComboFinished(player)
  CombosComm.sendFinished(player, combo, self:playerState(player))
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
      self:Finish(player, combo)
    end
  elseif not ability:IsInvocationAbility() then
    CombosComm.sendStepError(player, combo, ability)
  end
end

--- Handles damage instances being dealt to entities.
-- @tparam invokation.dota2.DamageInstance damage DamageInstance instance
-- @fixme Abilities can still be producing damage instances after the combo has finished
function M:OnEntityHurt(damage)
  self:d("Combos:OnEntityHurt()")
  self:d("  category:", damage.category)
  self:d("  damage:", damage.amount)
  self:d("  victim:", damage:VictimName())
  self:d("  attacker:", damage:AttackerName())
  self:d("  inflictor:", damage:InflictorName())

  if damage.attacker == nil then
    return
  end

  local player = damage.attacker:GetPlayerOwner()

  if player == nil then
    return
  end

  local combo = self:getPlayerState(player, "combo")

  if combo == nil then
    return
  end

  local damageTotal = self:getPlayerState(player, "damage", 0) + damage.amount
  self:setPlayerState(player, "damage", damageTotal)
end

--- Communicates to player clients to open the combo picker.
function M.ShowPicker()
  CombosComm.sendPickerShow()
end

return M

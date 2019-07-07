-- TODO: use combo IDs instead of names
local M = require("pl.class")()

local tablex = require("pl.tablex")
local Combo = require("combos.combo")
local COMBOS = require("const.combos")
local CombosComm = require("combos.communication")

local NET_TABLE_KEY = "combos"

function M:_init(args)
  self.logger = args.logger
  self.netTable = args.netTable
  self.combos = {}
  self.active = {}
  self.capturing = {}
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

function M:Load()
  self:d("Combos:Load() - loading combos")

  self.combos = {}
  self.combosByName = {}

  for name, config in pairs(COMBOS) do
    config.id = "invokation_combo_" .. name
    config.name = name

    for id, step in pairs(config.sequence) do
      step.id = id
    end

    local combo = Combo(name, config)

    table.insert(self.combos, combo)

    self.combosByName[name] = combo
  end

  self.netTable:Set(NET_TABLE_KEY, COMBOS)

  self:d("Combos:Load() - finished loading combos")
end

function M:Find(name)
  return self.combosByName[name]
end

-- TODO: implement countdown
-- TODO: implement completion timer comparing against ideal time
-- TODO: setup dummy target + hero (level, abilities, prepared invokations, mana, cds) + items
function M:Start(player, combo)
  self:d("Combos:Start()", player:GetPlayerID(), combo.name)

  if not combo:Reset() then
    self:errf("Could not reset combo '%s'", combo.name)
    return
  end

  self.active[player:GetPlayerID()] = combo

  CombosComm.emitSound(player, "combo_start")
  CombosComm.sendStarted(player, combo)
end

function M:Stop(player)
  self:d("Combos:Stop()", player:GetPlayerID())

  self.active[player:GetPlayerID()] = nil

  CombosComm.emitSound(player, "combo_stop")
  CombosComm.sendStopped(player)
end

function M:StartCapturingAbilities(player)
  self:d("Combos:StartCapturingAbilities()", player:GetPlayerID())
  self.capturing[player:GetPlayerID()] = true
end

function M:StopCapturingAbilities(player)
  self:d("Combos:StopCapturingAbilities()", player:GetPlayerID())
  self.capturing[player:GetPlayerID()] = nil
end

-- TODO: check for finished combo and give reward (<difficulty> gold?)
function M:OnAbilityUsed(player, unit, ability)
  self:d("Combos:OnAbilityUsed()", player:GetPlayerID(), unit.name, ability.name)

  local playerId = player:GetPlayerID()

  if self.capturing[playerId] then
    CombosComm.sendAbilityUsed(player, ability)
  end

  local combo = self.active[playerId]

  if combo == nil then
    return
  end

  if combo:Progress(ability) then
    if combo:IsFinished() then
      CombosComm.sendFinished(player, combo)
    else
      CombosComm.sendProgress(player, combo)
    end
  elseif not ability:IsInvokationAbility() then
    CombosComm.sendStepError(player, combo, ability)
  end
end

function M.ShowPicker()
  CombosComm.sendPickerShow()
end

return M

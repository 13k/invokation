-- TODO: use combo IDs instead of names
local M = require("pl.class")()

local Combo = require("combos.combo")
local COMBOS = require("const.combos")
local CombosHero = require("combos.hero")
local CombosComm = require("combos.communication")
local DummyTarget = require("combos.dummy_target")

local NET_TABLE_KEY = "combos"

local SOUND_EVENTS = {
  dummy_create = {
    "Hero_ShadowShaman.Hex.Target"
  },
  combo_start = {
    "invoker_invo_begin_01",
    "invoker_invo_move_08",
    "invoker_invo_move_09",
    "invoker_invo_move_13",
    "invoker_invo_attack_05",
    "invoker_invo_ability_invoke_01",
  },
  combo_stop = {
    "invoker_invo_failure_04",
  }
}

local MUSIC = {
  IDLE = {
    STATUS = DOTA_MUSIC_STATUS_PRE_GAME_EXPLORATION,
    INTENSITY = 1.0,
  },
  BATTLE = {
    STATUS = DOTA_MUSIC_STATUS_BATTLE,
    INTENSITY = 1.0,
  },
  VICTORY = {
    STATUS = DOTA_MUSIC_STATUS_EXPLORATION,
    INTENSITY = 1.0,
  },
}

local function randomSoundEvent(stage)
  local events = SOUND_EVENTS[stage]
  return events[RandomInt(1, #events)]
end

function M:_init(args)
  self.logger = args.logger
  self.netTable = args.netTable
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

    local combo = Combo(config)

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
    CombosComm.emitSound(player, randomSoundEvent("dummy_create"))
  end

  dummy:Reset()
  player:SetMusicStatus(MUSIC.BATTLE.STATUS, MUSIC.BATTLE.INTENSITY)
  CombosHero.setup(player, combo)
  CombosComm.emitSound(player, randomSoundEvent("combo_start"))
  CombosComm.sendStarted(player, combo)
end

function M:Restart(player, combo)
  self:d("Combos:Restart()", player:GetPlayerID(), combo.name)
  return self:Start(player, combo)
end

function M:Stop(player)
  self:d("Combos:Stop()", player:GetPlayerID())

  self:getPlayerState(player, "dummy"):Kill()
  self:setPlayerState(player, "combo", nil)

  player:SetMusicStatus(MUSIC.IDLE.STATUS, MUSIC.IDLE.INTENSITY)
  CombosComm.emitSound(player, randomSoundEvent("combo_stop"))
  CombosComm.sendStopped(player)
end

function M:Finish(player, combo)
  self:d("Combos:Finish()", player:GetPlayerID(), combo.name)

  local hero = player:GetAssignedHero()

  hero:PerformTaunt()
  player:SetMusicStatus(MUSIC.VICTORY.STATUS, MUSIC.VICTORY.INTENSITY)
  CombosComm.sendFinished(player, combo, self:playerState(player))
end

function M:StartCapturingAbilities(player)
  self:d("Combos:StartCapturingAbilities()", player:GetPlayerID())
  self:setPlayerState(player, "capturing", true)
end

function M:StopCapturingAbilities(player)
  self:d("Combos:StopCapturingAbilities()", player:GetPlayerID())
  self:setPlayerState(player, "capturing", nil)
end

-- TODO: implement wait/delay steps
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
  elseif not ability:IsInvokationAbility() then
    CombosComm.sendStepError(player, combo, ability)
  end
end

-- FIXME: abilities can still be producing damage instances after the combo has finished
function M:OnEntityHurt(instance)
  self:d("Combos:OnEntityHurt()")
  self:d("  attacker:", instance:AttackerName())
  self:d("  inflictor:", instance:InflictorName())
  self:d("  victim:", instance:VictimName())
  self:d("  category:", instance.category)
  self:d("  damage:", instance.damage)

  if instance.attacker == nil then
    return
  end

  local player = instance.attacker:GetPlayerOwner()
  local combo = self:getPlayerState(player, "combo")

  if combo == nil then
    return
  end

  local damage = self:getPlayerState(player, "damage", 0)
  self:setPlayerState(player, "damage", damage + instance.damage)
end

function M.ShowPicker()
  CombosComm.sendPickerShow()
end

return M

local module = require("pl.class")()

local tablex = require("pl.tablex")
local ltable = require("lang.table")
local Combo = require("combos.combo")
local SoundEvents = require("dota2.sound_events")
local CustomEvents = require("dota2.custom_events")

local KV_FILE = "scripts/kv/combos.txt"
local NET_TABLE_KEY = "combos"

local function loadKV()
  return LoadKeyValues(KV_FILE)
end

local function normalizeKV(kv)
  for _, config in pairs(kv) do
    config.sequence = ltable.tolist(config.sequence)
  end

  return kv
end

local function createCombos(kv)
  local combos = {}

  for name, config in pairs(kv) do
    local combo = Combo(name, config)
    table.insert(combos, combo)
  end

  return combos
end

function module:_init(args)
  self.logger = args.logger
  self.netTable = args.netTable
  self.kv = {}
  self.combos = {}
  self.active = {}
  self.capturing = {}
end

function module:d(...)
  return self.logger:Debug(...)
end

function module:setNetTable()
  return self.netTable:Set(NET_TABLE_KEY, self.kv)
end

function module:loadKV()
  self.kv = normalizeKV(loadKV())
end

function module:createCombos()
  self.combos = createCombos(self.kv)
  self.combosByName =
    tablex.pairmap(
    function(_, v)
      return v, v.name
    end,
    self.combos
  )
end

function module:Load()
  self:d("loading combos")

  self:loadKV()
  self:createCombos()
  self:setNetTable()

  self:d("finished loading combos")
end

function module:Find(name)
  return self.combosByName[name]
end

function module:Start(player, combo)
  self.active[player:GetPlayerID()] = combo

  local sndEvent = "combo_start_" .. tostring(RandomInt(1, 6))

  SoundEvents.EmitOnPlayer(player, sndEvent)
  CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBO_STARTED, {name = combo.name})
end

function module:Stop(player)
  self.active[player:GetPlayerID()] = nil

  SoundEvents.EmitOnPlayer(player, "combo_stop_1")
  CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBO_STOPPED)
end

function module:StartCapturingAbilities(player)
  self:d("[combos] StartCapturingAbilities()", player:GetPlayerID())
  self.capturing[player:GetPlayerID()] = true
  -- TODO: timer logic
end

function module:StopCapturingAbilities(player)
  self:d("[combos] StopCapturingAbilities()", player:GetPlayerID())
  self.capturing[player:GetPlayerID()] = nil
  -- TODO: timer logic
end

function module:OnAbilityUsed(player, abilityName)
  self:d("[combos] OnAbilityUsed()", abilityName)

  if self.capturing[player:GetPlayerID()] then
    CustomEvents.SendPlayer(player, CustomEvents.EVENT_COMBAT_LOG_ABILITY_USED, {name = abilityName})
  end

  local combo = self.active[player:GetPlayerID()]

  if combo == nil then
    return
  end

  -- TODO: check combo's FSM for transitions and dispatch events
end

function module.ShowPicker()
  CustomEvents.SendAll(CustomEvents.EVENT_PICKER_SHOW)
end

return module

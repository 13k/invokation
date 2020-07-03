local create = require("support.factory").create

local Combo = require("invokation.combos.combo")
local CombosComm = require("invokation.combos.communication")
local CustomEvents = require("invokation.dota2.custom_events")

describe("combos.communication", function()
  local combo
  local player = {}
  local ability = create("ability", {name = "ability"})

  local comboSpec = {id = 13, sequence = {{id = 1, name = "ability"}}}

  local clockIdx
  local function clock()
    clockIdx = clockIdx + 1
    return clockIdx
  end

  before_each(function()
    combo = Combo(comboSpec)
    clockIdx = 0
    spy.on(CustomEvents, "SendPlayer")
  end)

  after_each(function()
    CustomEvents.SendPlayer:revert()
  end)

  describe(".sendAbilityUsed", function()
    it("sends custom event", function()
      local payload = {ability = "ability"}

      CombosComm.sendAbilityUsed(player, ability)

      assert.spy(CustomEvents.SendPlayer).was.called_with(CustomEvents.EVENT_COMBAT_LOG_ABILITY_USED, player, payload)
    end)
  end)

  describe(".sendStarted", function()
    it("sends custom event", function()
      local payload = {id = 13, next = {1}}

      CombosComm.sendStarted(player, combo)

      assert.spy(CustomEvents.SendPlayer).was.called_with(CustomEvents.EVENT_COMBO_STARTED, player, payload)
    end)
  end)

  describe(".sendStopped", function()
    it("sends custom event", function()
      local payload = {id = 13}

      CombosComm.sendStopped(player, combo)

      assert.spy(CustomEvents.SendPlayer).was.called_with(CustomEvents.EVENT_COMBO_STOPPED, player, payload)
    end)
  end)

  describe(".sendInProgress", function()
    it("sends custom event", function()
      local payload = {id = 13}

      CombosComm.sendInProgress(player, combo)

      assert.spy(CustomEvents.SendPlayer).was.called_with(CustomEvents.EVENT_COMBO_IN_PROGRESS, player, payload)
    end)
  end)

  describe(".sendProgress", function()
    it("sends custom event", function()
      assert.is_true(combo:Progress(ability))
      assert.are.equal(123, combo:IncrementDamage(123))

      local payload = {id = 13, metrics = {count = 1, damage = 123, duration = nil}, next = {}}

      CombosComm.sendProgress(player, combo)

      assert.spy(CustomEvents.SendPlayer).was.called_with(CustomEvents.EVENT_COMBO_PROGRESS, player, payload)
    end)
  end)

  describe(".sendStepError", function()
    it("sends custom event", function()
      local payload = {id = 13, expected = {1}, ability = "ability"}

      CombosComm.sendStepError(player, combo, ability)

      assert.spy(CustomEvents.SendPlayer).was.called_with(CustomEvents.EVENT_COMBO_STEP_ERROR, player, payload)
    end)
  end)

  describe(".sendPreFinish", function()
    it("sends custom event", function()
      local abilityWithWait = create("ability", {name = "ability", AbilityDuration = 3.5})

      local comboWithDelay = Combo(comboSpec, {clock = clock})

      assert.is_true(comboWithDelay:Progress(abilityWithWait))
      assert.are.equal(123, comboWithDelay:IncrementDamage(123))
      assert.is_true(comboWithDelay:PreFinish())

      local payload = {id = 13, metrics = {count = 1, damage = 123, duration = nil}, wait = 2.5}

      CombosComm.sendPreFinish(player, comboWithDelay)

      assert.spy(CustomEvents.SendPlayer).was.called_with(CustomEvents.EVENT_COMBO_PRE_FINISH, player, payload)
    end)
  end)

  describe(".sendFinished", function()
    it("sends custom event", function()
      local comboWithDelay = Combo(comboSpec, {clock = clock})

      assert.is_true(comboWithDelay:Progress(ability))
      assert.are.equal(123, comboWithDelay:IncrementDamage(123))
      assert.is_true(comboWithDelay:PreFinish())
      assert.is_true(comboWithDelay:Finish())

      local payload = {id = 13, metrics = {count = 1, damage = 123, duration = 3}}

      CombosComm.sendFinished(player, comboWithDelay)

      assert.spy(CustomEvents.SendPlayer).was.called_with(CustomEvents.EVENT_COMBO_FINISHED, player, payload)
    end)
  end)
end)

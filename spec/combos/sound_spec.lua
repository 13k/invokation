local CombosSound = require("invokation.combos.sound")
local SoundEvents = require("invokation.dota2.sound_events")

describe("combos.sound", function()
  local player = CDOTAPlayer({})
  local entity = {}
  local dummy = { entity = entity }

  local stubRandomInt
  local spyEmitOnEntity
  local spyEmitOnPlayer
  local spySetMusicStatus

  before_each(function()
    -- selene: allow(global_usage)
    stubRandomInt = stub.new(_G, "RandomInt", 1)
    spyEmitOnEntity = spy.on(SoundEvents, "EmitOnEntity")
    spyEmitOnPlayer = spy.on(SoundEvents, "EmitOnPlayer")
    spySetMusicStatus = spy.on(player, "SetMusicStatus")
  end)

  after_each(function()
    stubRandomInt:revert()
    spyEmitOnEntity:revert()
    spyEmitOnPlayer:revert()
    spySetMusicStatus:revert()
  end)

  describe(".emitRandomEventOnEntity", function()
    it("emits random sound event on entity", function()
      local events = { "a", "b", "c" }

      CombosSound.emitRandomEventOnEntity(entity, events)

      assert.stub(stubRandomInt).was.called_with(1, 3)
      assert.spy(spyEmitOnEntity).was.called_with("a", entity)
    end)
  end)

  describe(".emitRandomEventOnPlayer", function()
    it("emits random sound event on player", function()
      local events = { "a", "b", "c" }

      CombosSound.emitRandomEventOnPlayer(player, events)

      assert.stub(stubRandomInt).was.called_with(1, 3)
      assert.spy(spyEmitOnPlayer).was.called_with("a", player)
    end)
  end)

  describe(".onDummyCreate", function()
    it("emits random dummy create sound event on dummy entity", function()
      CombosSound.onDummyCreate(dummy)

      assert.stub(stubRandomInt).was.called_with(1, #SoundEvents.SNDEVTS_DUMMY_CREATE)
      assert.spy(spyEmitOnEntity).was.called_with(SoundEvents.SNDEVTS_DUMMY_CREATE[1], dummy.entity)
    end)
  end)

  describe(".onComboStart", function()
    it("sets the music status on the player", function()
      CombosSound.onComboStart(player)

      assert.spy(spySetMusicStatus).was_called(1)
    end)
  end)

  describe(".onComboStop", function()
    it("sets the music status on the player", function()
      CombosSound.onComboStop(player)

      assert.spy(spySetMusicStatus).was_called(1)
    end)
  end)

  describe(".onComboStepError", function()
    it("sets the music status on the player", function()
      CombosSound.onComboStepError(player)

      assert.spy(spySetMusicStatus).was_called(1)
    end)
  end)

  describe(".onComboFinished", function()
    it("sets the music status on the player", function()
      CombosSound.onComboFinished(player)

      assert.spy(spySetMusicStatus).was_called(1)
    end)
  end)
end)

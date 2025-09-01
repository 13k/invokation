local F = require("support.factory")
local Mock = require("support.mock")

local SOUND_EVENTS = require("invk.const.sound_events")
local combo_sound = require("invk.combo.sound")
local sound_ev = require("invk.dota2.sound_events")

describe("invk.combo.sound", function()
  local mocks = Mock()
  local player = F.dota_player()
  local entity = F.dota_entity({ name = "ent_dummy" })
  local dummy = { entity = entity } --- @cast dummy invk.dota2.DummyTarget

  before_each(function()
    -- selene: allow(global_usage)
    mocks:stub("_G", _G, "RandomInt", 1)
    mocks:spy("sound_events", sound_ev, "emit_on_entity")
    mocks:spy("sound_events", sound_ev, "emit_on_player")
    mocks:spy("player", player, "SetMusicStatus")
  end)

  after_each(function()
    mocks:reset()
  end)

  describe(".emit_random_event_on_entity", function()
    it("emits random sound event on entity", function()
      local events = { "a", "b", "c" }

      combo_sound.emit_random_event_on_entity(entity, events)

      mocks:assert("_G", "RandomInt").called_with(1, 3)
      mocks:assert("sound_events", "emit_on_entity").called_with("a", entity)
    end)
  end)

  describe(".emit_random_event_on_player", function()
    it("emits random sound event on player", function()
      local events = { "a", "b", "c" }

      combo_sound.emit_random_event_on_player(player, events)

      mocks:assert("_G", "RandomInt").called_with(1, 3)
      mocks:assert("sound_events", "emit_on_player").called_with("a", player)
    end)
  end)

  describe(".on_dummy_create", function()
    it("emits random dummy create sound event on dummy entity", function()
      combo_sound.on_dummy_create(dummy)

      mocks:assert("_G", "RandomInt").called_with(1, #SOUND_EVENTS.SNDEVTS_DUMMY_CREATE)
      mocks
        :assert("sound_events", "emit_on_entity")
        .called_with(SOUND_EVENTS.SNDEVTS_DUMMY_CREATE[1], dummy.entity)
    end)
  end)

  describe(".on_combo_start", function()
    it("sets the music status on the player", function()
      combo_sound.on_combo_start(player)

      mocks:assert("player", "SetMusicStatus").called(1)
    end)
  end)

  describe(".on_combo_stop", function()
    it("sets the music status on the player", function()
      combo_sound.on_combo_stop(player)

      mocks:assert("player", "SetMusicStatus").called(1)
    end)
  end)

  describe(".on_combo_step_error", function()
    it("sets the music status on the player", function()
      combo_sound.on_combo_step_error(player)

      mocks:assert("player", "SetMusicStatus").called(1)
    end)
  end)

  describe(".on_combo_finished", function()
    it("sets the music status on the player", function()
      combo_sound.on_combo_finished(player)

      mocks:assert("player", "SetMusicStatus").called(1)
    end)
  end)
end)

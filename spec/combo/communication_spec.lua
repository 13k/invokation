local assert = require("luassert")

local F = require("support.factory")
local Mock = require("support.mock")
local MockClock = require("support.dota2.clock")

local CUSTOM_EVENTS = require("invk.const.custom_events")
local Combo = require("invk.combo.combo")
local S = require("invk.combo.spec")
local combo_comms = require("invk.combo.communication")
local custom_ev = require("invk.dota2.custom_events")
local talents = require("invk.dota2.talents")

local Talents = talents.Talents

--- @type invk.combo.ComboSpec
local SPEC = {
  id = 13,
  specialty = S.Specialty.QuasWex,
  stance = S.Stance.Defensive,
  damage_rating = S.DamageRating.None,
  difficulty_rating = S.DifficultyRating.Easy,
  gold = 1234,
  items = { "item_blink" },
  hero_level = 30,
  orbs = { 1, 2, 3 },
  talents = Talents.NONE,
  tags = { "testing" },
  sequence = { { id = 1, name = "ability" } },
}

describe("invk.combo.communication", function()
  --- @type invk.combo.Combo
  local combo
  --- @type support.dota2.MockClock
  local clock = MockClock()
  local player = F.dota_player()
  local ability = F.ability({ name = "ability" })
  --- @type support.Mock
  local mocks = Mock()

  before_each(function()
    mocks:spy("custom_events", custom_ev, "send_player")
    clock:reset()

    combo = Combo:new(SPEC, { clock = clock })
  end)

  after_each(function()
    mocks:revert("custom_events", "send_player")
  end)

  describe(".send_ability_used", function()
    it("sends custom event", function()
      --- @type invk.custom_events.CombatLogAbilityUsedPayload
      local payload = {
        ability = "ability",
      }

      combo_comms.send_ability_used(player, ability)

      mocks
        :assert("custom_events", "send_player")
        .called_with(CUSTOM_EVENTS.EVENT_COMBAT_LOG_ABILITY_USED, player, payload)
    end)
  end)

  describe(".send_started", function()
    it("sends custom event", function()
      --- @type invk.custom_events.ComboStartedPayload
      local payload = {
        id = 13,
        next = { 1 },
      }

      combo_comms.send_started(player, combo)

      mocks
        :assert("custom_events", "send_player")
        .called_with(CUSTOM_EVENTS.EVENT_COMBO_STARTED, player, payload)
    end)
  end)

  describe(".send_stopped", function()
    it("sends custom event", function()
      --- @type invk.custom_events.ComboStoppedPayload
      local payload = {
        id = 13,
      }

      combo_comms.send_stopped(player, combo)

      mocks
        :assert("custom_events", "send_player")
        .called_with(CUSTOM_EVENTS.EVENT_COMBO_STOPPED, player, payload)
    end)
  end)

  describe(".send_in_progress", function()
    it("sends custom event", function()
      --- @type invk.custom_events.ComboInProgressPayload
      local payload = {
        id = 13,
      }

      combo_comms.send_in_progress(player, combo)

      mocks
        :assert("custom_events", "send_player")
        .called_with(CUSTOM_EVENTS.EVENT_COMBO_IN_PROGRESS, player, payload)
    end)
  end)

  describe(".send_progress", function()
    it("sends custom event", function()
      assert.is_true(combo:progress(ability))
      assert.equal(123, combo:increment_damage(123))

      --- @type invk.custom_events.ComboProgressPayload
      local payload = {
        id = 13,
        metrics = { count = 1, damage = 123, duration = 0 },
        next = {},
      }

      combo_comms.send_progress(player, combo)

      mocks
        :assert("custom_events", "send_player")
        .called_with(CUSTOM_EVENTS.EVENT_COMBO_PROGRESS, player, payload)
    end)
  end)

  describe(".send_step_error", function()
    it("sends custom event", function()
      --- @type invk.custom_events.ComboStepErrorPayload
      local payload = {
        id = 13,
        expected = { 1 },
        ability = "ability",
      }

      combo_comms.send_step_error(player, combo, ability)

      mocks
        :assert("custom_events", "send_player")
        .called_with(CUSTOM_EVENTS.EVENT_COMBO_STEP_ERROR, player, payload)
    end)
  end)

  describe(".send_pre_finish", function()
    it("sends custom event", function()
      local ability_with_wait = F.ability({ name = "ability", AbilityDuration = 3.5 })

      assert.is_true(combo:progress(ability_with_wait))
      assert.equal(123, combo:increment_damage(123))
      assert.is_true(combo:pre_finish())

      --- @type invk.custom_events.ComboPreFinishPayload
      local payload = {
        id = 13,
        metrics = { count = 1, damage = 123, duration = 0 },
        wait = 2.5,
      }

      combo_comms.send_pre_finish(player, combo)

      mocks
        :assert("custom_events", "send_player")
        .called_with(CUSTOM_EVENTS.EVENT_COMBO_PRE_FINISH, player, payload)
    end)
  end)

  describe(".send_finished", function()
    it("sends custom event", function()
      assert.is_true(combo:progress(ability))
      assert.equal(123, combo:increment_damage(123))
      assert.is_true(combo:pre_finish())
      assert.is_true(combo:finish())

      --- @type invk.custom_events.ComboFinishedPayload
      local payload = {
        id = 13,
        metrics = { count = 1, damage = 123, duration = 3 },
      }

      combo_comms.send_finished(player, combo)

      mocks
        :assert("custom_events", "send_player")
        .called_with(CUSTOM_EVENTS.EVENT_COMBO_FINISHED, player, payload)
    end)
  end)
end)

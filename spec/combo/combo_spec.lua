local assert = require("luassert")
local m = require("moses")
local spy = require("luassert.spy")

local F = require("support.factory")
local MockClock = require("support.dota2.clock")

local BaseCombo = require("invk.combo.base_combo")
local Combo = require("invk.combo.combo")
local ComboSequence = require("invk.combo.combo_sequence")
local S = require("invk.combo.spec")
local talents = require("invk.dota2.talents")

local State = BaseCombo.State
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
  orbs = { 7, 7, 7 },
  talents = talents.select(
    Talents.L10_LEFT,
    Talents.L15_RIGHT,
    Talents.L20_RIGHT,
    Talents.L25_RIGHT
  ),
  tags = { "late-game" },
  sequence = {
    { id = 1, name = "step1", required = true, next = { 2, 3 } },
    { id = 2, name = "step2", next = { 3 } },
    { id = 3, name = "step3", required = true },
  },
}

describe("invk.combo.Combo", function()
  --- @type invk.combo.Combo
  local combo
  --- @type support.dota2.MockClock
  local clock = MockClock()

  local function steps_ids(arr)
    return m.map(arr, function(s)
      return s.id
    end)
  end

  local ability1 = F.ability({ name = "step1", AbilityDuration = 0.5 })
  local ability2 = F.ability({ name = "step2", AbilityDuration = 0.3 })
  local ability3 = F.ability({ name = "step3", AbilityDuration = 0.25 })

  before_each(function()
    clock:reset()
    combo = Combo:new(SPEC, { clock = clock })
  end)

  it("inherits from BaseCombo", function()
    assert.is_true(Combo:isSubclassOf(BaseCombo))
    assert.is_true(combo:isInstanceOf(BaseCombo))
  end)

  describe("constructor", function()
    it("initializes attributes", function()
      for key, value in pairs(m.omit(SPEC, { "sequence" })) do
        assert.same(SPEC[key], value)
      end

      assert.equal(State.Initial, combo.state)
      assert.equal(0, combo.metrics.count)
      assert.equal(0, combo.metrics.damage)
      assert.equal(0, combo.metrics.duration)
      assert.equal(clock, combo.clock)
      assert.is_true(combo.sequence:isInstanceOf(ComboSequence))
    end)
  end)

  describe("#todot", function()
    it("delegates to sequence", function()
      local spy_todot = spy.on(combo.sequence, "todot")

      combo:todot()

      assert.spy(spy_todot).called(1)
    end)
  end)

  describe(":current_step_id", function()
    it("returns the current step id", function()
      assert.is_nil(combo:current_step_id())
      assert.is_true(combo:progress(ability1))
      assert.equal(1, combo:current_step_id())
      assert.is_true(combo:progress(ability2))
      assert.equal(2, combo:current_step_id())
      assert.is_true(combo:progress(ability3))
      assert.equal(3, combo:current_step_id())
      assert.is_true(combo:pre_finish())
      assert.is_nil(combo:current_step_id())
      assert.is_true(combo:finish())
      assert.is_nil(combo:current_step_id())
    end)
  end)

  describe(":current_step", function()
    it("returns the current step", function()
      assert.is_nil(combo:current_step())

      do
        assert.is_true(combo:progress(ability1))

        local step = combo:current_step()

        assert.is_table(step)
        --- @cast step invk.combo.ComboStep
        assert.equal(1, step.id)
        assert.equal("step1", step.name)
      end

      do
        assert.is_true(combo:progress(ability2))

        local step = combo:current_step()

        assert.is_table(step)
        --- @cast step invk.combo.ComboStep
        assert.equal(2, step.id)
        assert.equal("step2", step.name)
      end

      do
        assert.is_true(combo:progress(ability3))

        local step = combo:current_step()

        assert.is_table(step)
        --- @cast step invk.combo.ComboStep
        assert.equal(3, step.id)
        assert.equal("step3", step.name)
      end

      assert.is_true(combo:pre_finish())
      assert.is_nil(combo:current_step())
      assert.is_true(combo:finish())
      assert.is_nil(combo:current_step())
    end)
  end)

  describe(":next_steps_ids", function()
    it("returns the next steps ids", function()
      assert.same({ 1 }, combo:next_steps_ids())
      assert.is_true(combo:progress(ability1))
      assert.same({ 2, 3 }, combo:next_steps_ids())
      assert.is_true(combo:progress(ability2))
      assert.same({ 3 }, combo:next_steps_ids())
      assert.is_true(combo:progress(ability3))
      assert.same({}, combo:next_steps_ids())
      assert.is_true(combo:pre_finish())
      assert.same({}, combo:next_steps_ids())
      assert.is_true(combo:finish())
      assert.same({}, combo:next_steps_ids())
    end)
  end)

  describe(":next_steps", function()
    it("returns the next steps", function()
      assert.same({ 1 }, steps_ids(combo:next_steps()))
      assert.is_true(combo:progress(ability1))
      assert.same({ 2, 3 }, steps_ids(combo:next_steps()))
      assert.is_true(combo:progress(ability2))
      assert.same({ 3 }, steps_ids(combo:next_steps()))
      assert.is_true(combo:progress(ability3))
      assert.same({}, combo:next_steps())
      assert.is_true(combo:pre_finish())
      assert.same({}, combo:next_steps())
      assert.is_true(combo:finish())
      assert.same({}, combo:next_steps())
    end)
  end)

  describe(":progress", function()
    describe("with valid abilities", function()
      it("progresses the combo", function()
        assert.equal(State.Initial, combo.state)
        assert.equal(0, combo.metrics.count)
        assert.is_nil(combo:current_step())
        assert.is_nil(combo:current_step_id())
        assert.same({ 1 }, combo:next_steps_ids())
        assert.same({ 1 }, steps_ids(combo:next_steps()))

        do
          assert.is_true(combo:progress(ability1))

          local step = combo:current_step()

          assert.equal(State.Started, combo.state)
          assert.equal(1, combo.metrics.count)
          assert.is_not_nil(step) --- @cast step invk.combo.ComboStep
          assert.same(1, step.id)
          assert.equal(1, combo:current_step_id())
          assert.same({ 2, 3 }, combo:next_steps_ids())
          assert.same({ 2, 3 }, steps_ids(combo:next_steps()))
        end

        do
          assert.is_true(combo:progress(ability2))

          local step = combo:current_step()

          assert.equal(State.Started, combo.state)
          assert.equal(2, combo.metrics.count)
          assert.is_not_nil(step) --- @cast step invk.combo.ComboStep
          assert.same(2, step.id)
          assert.equal(2, combo:current_step_id())
          assert.same({ 3 }, combo:next_steps_ids())
          assert.same({ 3 }, steps_ids(combo:next_steps()))
        end

        do
          assert.is_true(combo:progress(ability3))

          local step = combo:current_step()

          assert.equal(State.Started, combo.state)
          assert.equal(3, combo.metrics.count)
          assert.is_not_nil(step) --- @cast step invk.combo.ComboStep
          assert.same(3, step.id)
          assert.equal(3, combo:current_step_id())
          assert.same({}, combo:next_steps_ids())
          assert.same({}, steps_ids(combo:next_steps()))
        end
      end)

      it("enables skipping optional steps", function()
        assert.is_true(combo:progress(ability1))
        assert.is_true(combo:progress(ability3))
      end)
    end)

    describe("with invalid abilities", function()
      local invalid_ability = F.ability({
        name = "invalid",
        AbilityDuration = 0.5,
      })

      it("does NOT progress the combo", function()
        assert.equal(State.Initial, combo.state)
        assert.equal(0, combo.metrics.count)
        assert.is_nil(combo:current_step())
        assert.is_nil(combo:current_step_id())
        assert.same({ 1 }, combo:next_steps_ids())
        assert.same({ 1 }, steps_ids(combo:next_steps()))

        assert.is_false(combo:progress(invalid_ability))

        assert.equal(State.Initial, combo.state)
        assert.equal(0, combo.metrics.count)
        assert.is_nil(combo:current_step())
        assert.is_nil(combo:current_step_id())
        assert.same({ 1 }, combo:next_steps_ids())
        assert.same({ 1 }, steps_ids(combo:next_steps()))

        do
          assert.is_true(combo:progress(ability1))

          local step = combo:current_step()

          assert.equal(State.Started, combo.state)
          assert.equal(1, combo.metrics.count)
          assert.is_table(step) --- @cast step invk.combo.ComboStep
          assert.same(1, step.id)
          assert.equal(1, combo:current_step_id())
          assert.same({ 2, 3 }, combo:next_steps_ids())
          assert.same({ 2, 3 }, steps_ids(combo:next_steps()))
        end

        do
          assert.is_false(combo:progress(invalid_ability))

          local step = combo:current_step()

          assert.equal(State.Started, combo.state)
          assert.equal(1, combo.metrics.count)
          assert.is_table(step) --- @cast step invk.combo.ComboStep
          assert.same(1, step.id)
          assert.equal(1, combo:current_step_id())
          assert.same({ 2, 3 }, combo:next_steps_ids())
          assert.same({ 2, 3 }, steps_ids(combo:next_steps()))
        end
      end)
    end)
  end)

  describe(":fail", function()
    it("flags the combo as failed", function()
      assert.equal(State.Initial, combo.state)

      combo:fail()

      assert.equal(State.Failed, combo.state)
    end)
  end)

  describe(":pre_finish", function()
    it("advances the combo to pre-finished state", function()
      assert.is_false(combo:pre_finish())
      assert.are_not_equal(State.PreFinished, combo.state)

      assert.is_true(combo:progress(ability1))
      assert.is_false(combo:pre_finish())
      assert.are_not_equal(State.PreFinished, combo.state)

      assert.is_true(combo:progress(ability2))
      assert.is_false(combo:pre_finish())
      assert.are_not_equal(State.PreFinished, combo.state)

      assert.is_true(combo:progress(ability3))
      assert.is_true(combo:pre_finish())
      assert.equal(State.PreFinished, combo.state)
    end)

    it("sets the wait times", function()
      local spy_wait_finish = spy.on(combo.wait, "finish")

      assert.is_true(combo:progress(ability1))
      assert.is_true(combo:progress(ability2))
      assert.is_true(combo:progress(ability3))
      assert.is_true(combo:pre_finish())

      assert.spy(spy_wait_finish).called(1)
    end)
  end)

  describe(":finish", function()
    it("advances the combo to finished state", function()
      assert.is_false(combo:finish())
      assert.are_not_equal(State.Finished, combo.state)

      assert.is_true(combo:progress(ability1))
      assert.is_false(combo:finish())
      assert.are_not_equal(State.Finished, combo.state)

      assert.is_true(combo:progress(ability2))
      assert.is_false(combo:finish())
      assert.are_not_equal(State.Finished, combo.state)

      assert.is_true(combo:progress(ability3))
      assert.is_false(combo:finish())
      assert.are_not_equal(State.Finished, combo.state)

      assert.is_true(combo:pre_finish())
      assert.is_true(combo:finish())
      assert.equal(State.Finished, combo.state)
    end)

    it("sets the combo duration", function()
      assert.is_true(combo:progress(ability1))
      assert.is_true(combo:progress(ability2))
      assert.is_true(combo:progress(ability3))
      assert.is_true(combo:pre_finish())
      assert.is_true(combo:finish())
      assert.equal(7, combo.metrics.duration)
    end)
  end)
end)

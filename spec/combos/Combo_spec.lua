local m = require("moses")
local create = require("support.factory").create

local Combo = require("invokation.combos.Combo")
local Talents = require("invokation.dota2.talents")
local BaseCombo = require("invokation.combos.BaseCombo")
local ComboSequence = require("invokation.combos.ComboSequence")

local SPEC = {
  id = 13,
  specialty = "qw",
  stance = "defensive",
  heroLevel = 25,
  damageRating = 5,
  difficultyRating = 5,
  gold = 1234,
  tags = {"late-game"},
  items = {"item_blink"},
  orbs = {7, 7, 7},
  talents = Talents.Select(Talents.L10_LEFT, Talents.L15_RIGHT, Talents.L20_RIGHT, Talents.L25_RIGHT),
  sequence = {
    {id = 1, name = "step1", required = true, next = {2, 3}},
    {id = 2, name = "step2", next = {3}},
    {id = 3, name = "step3", required = true},
  },
}

describe("Combo", function()
  local combo, spyClock

  local function clock()
    return 10
  end

  local getId = m.property("id")
  local function stepsIds(arr)
    return m.map(arr, getId)
  end

  local ability1 = create("ability", {name = "step1", AbilityDuration = 0.5})

  local ability2 = create("ability", {name = "step2", AbilityDuration = 0.3})

  local ability3 = create("ability", {name = "step3", AbilityDuration = 0.25})

  before_each(function()
    spyClock = spy.new(clock)
    combo = Combo(SPEC, {clock = spyClock})
  end)

  it("inherits from BaseCombo", function()
    assert.is_true(BaseCombo:class_of(combo))
  end)

  describe("constructor", function()
    it("initializes attributes", function()
      for key, value in pairs(m.omit(SPEC, {"sequence"})) do
        assert.are.same(SPEC[key], value)
      end

      assert.is_false(combo.started)
      assert.is_false(combo.failed)
      assert.is_false(combo.finished)
      assert.are.equal(0, combo.count)
      assert.are.equal(0, combo.damage)
      assert.are.equal(spyClock, combo.clock)
      assert.is_true(ComboSequence:class_of(combo.sequence))
    end)
  end)

  describe("#todot", function()
    it("delegates to sequence", function()
      local spyTodot = spy.on(combo.sequence, "todot")
      combo:todot()
      assert.spy(spyTodot).was_called(1)
    end)
  end)

  describe("#CurrentStepId", function()
    it("returns the current step id", function()
      assert.is_nil(combo:CurrentStepId())
      assert.is_true(combo:Progress(ability1))
      assert.are.equal(1, combo:CurrentStepId())
      assert.is_true(combo:Progress(ability2))
      assert.are.equal(2, combo:CurrentStepId())
      assert.is_true(combo:Progress(ability3))
      assert.are.equal(3, combo:CurrentStepId())
      assert.is_true(combo:PreFinish())
      assert.is_nil(combo:CurrentStepId())
      assert.is_true(combo:Finish())
      assert.is_nil(combo:CurrentStepId())
    end)
  end)

  describe("#CurrentStep", function()
    it("returns the current step", function()
      assert.is_nil(combo:CurrentStep())

      assert.is_true(combo:Progress(ability1))
      assert.is_table(combo:CurrentStep())
      assert.are.equal(1, combo:CurrentStep().id)
      assert.are.equal("step1", combo:CurrentStep().name)

      assert.is_true(combo:Progress(ability2))
      assert.is_table(combo:CurrentStep())
      assert.are.equal(2, combo:CurrentStep().id)
      assert.are.equal("step2", combo:CurrentStep().name)

      assert.is_true(combo:Progress(ability3))
      assert.is_table(combo:CurrentStep())
      assert.are.equal(3, combo:CurrentStep().id)
      assert.are.equal("step3", combo:CurrentStep().name)

      assert.is_true(combo:PreFinish())
      assert.is_nil(combo:CurrentStep())
      assert.is_true(combo:Finish())
      assert.is_nil(combo:CurrentStep())
    end)
  end)

  describe("#NextStepsIds", function()
    it("returns the next steps ids", function()
      assert.are.same({1}, combo:NextStepsIds())
      assert.is_true(combo:Progress(ability1))
      assert.are.same({2, 3}, combo:NextStepsIds())
      assert.is_true(combo:Progress(ability2))
      assert.are.same({3}, combo:NextStepsIds())
      assert.is_true(combo:Progress(ability3))
      assert.are.same({}, combo:NextStepsIds())
      assert.is_true(combo:PreFinish())
      assert.are.same({}, combo:NextStepsIds())
      assert.is_true(combo:Finish())
      assert.are.same({}, combo:NextStepsIds())
    end)
  end)

  describe("#NextSteps", function()
    it("returns the next steps", function()
      assert.are.same({1}, stepsIds(combo:NextSteps()))
      assert.is_true(combo:Progress(ability1))
      assert.are.same({2, 3}, stepsIds(combo:NextSteps()))
      assert.is_true(combo:Progress(ability2))
      assert.are.same({3}, stepsIds(combo:NextSteps()))
      assert.is_true(combo:Progress(ability3))
      assert.are.same({}, combo:NextSteps())
      assert.is_true(combo:PreFinish())
      assert.are.same({}, combo:NextSteps())
      assert.is_true(combo:Finish())
      assert.are.same({}, combo:NextSteps())
    end)
  end)

  describe("#Progress", function()
    describe("with valid abilities", function()
      it("progresses the combo", function()
        assert.is_false(combo.started)
        assert.is_false(combo.failed)
        assert.is_false(combo.preFinished)
        assert.is_false(combo.finished)
        assert.are.equal(0, combo.count)
        assert.are.same({}, combo.waitQueue)
        assert.spy(combo.clock).was_not_called()
        assert.is_nil(combo:CurrentStep())
        assert.is_nil(combo:CurrentStepId())
        assert.are.same({1}, combo:NextStepsIds())
        assert.are.same({1}, stepsIds(combo:NextSteps()))

        assert.is_true(combo:Progress(ability1))

        assert.is_true(combo.started)
        assert.is_false(combo.failed)
        assert.is_false(combo.preFinished)
        assert.is_false(combo.finished)
        assert.are.equal(1, combo.count)
        assert.are.same({10.5}, combo.waitQueue)
        assert.spy(combo.clock).was_called(2)
        assert.are.same(1, combo:CurrentStep().id)
        assert.are.equal(1, combo:CurrentStepId())
        assert.are.same({2, 3}, combo:NextStepsIds())
        assert.are.same({2, 3}, stepsIds(combo:NextSteps()))

        assert.is_true(combo:Progress(ability2))

        assert.is_true(combo.started)
        assert.is_false(combo.failed)
        assert.is_false(combo.preFinished)
        assert.is_false(combo.finished)
        assert.are.equal(2, combo.count)
        assert.are.same({10.5, 10.3}, combo.waitQueue)
        assert.spy(combo.clock).was_called(4)
        assert.are.same(2, combo:CurrentStep().id)
        assert.are.equal(2, combo:CurrentStepId())
        assert.are.same({3}, combo:NextStepsIds())
        assert.are.same({3}, stepsIds(combo:NextSteps()))

        assert.is_true(combo:Progress(ability3))

        assert.is_true(combo.started)
        assert.is_false(combo.failed)
        assert.is_false(combo.preFinished)
        assert.is_false(combo.finished)
        assert.are.equal(3, combo.count)
        assert.are.same({10.5, 10.3, 10.25}, combo.waitQueue)
        assert.spy(combo.clock).was_called(6)
        assert.are.same(3, combo:CurrentStep().id)
        assert.are.equal(3, combo:CurrentStepId())
        assert.are.same({}, combo:NextStepsIds())
        assert.are.same({}, stepsIds(combo:NextSteps()))
      end)

      it("enables skipping optional steps", function()
        assert.is_true(combo:Progress(ability1))
        assert.is_true(combo:Progress(ability3))
      end)
    end)

    describe("with abilities listed in the wait special table", function()
      local spec = m.chain(SPEC):omit({"id", "sequence"}):extend(
                     {
          id = m.uniqueId(),
          sequence = {
            {id = 1, name = "invoker_alacrity", required = true, next = {2}},
            {id = 2, name = "invoker_cold_snap", required = true, next = {3}},
            {id = 3, name = "invoker_sun_strike", required = true},
          },
        }):value()

      local abilityAlacrity = create("ability",
                                     {name = "invoker_alacrity", special = {duration = 3.5}})

      local abilityColdSnap = create("ability",
                                     {name = "invoker_cold_snap", special = {duration = 1.25}})

      local abilitySunStrike = create("ability",
                                      {name = "invoker_sun_strike", special = {delay = 2.6}})

      it("uses abilities special values for wait times", function()
        combo = Combo(spec, {clock = spyClock})

        assert.are.same({}, combo.waitQueue)

        assert.is_true(combo:Progress(abilityAlacrity))
        assert.are.same({13.5}, combo.waitQueue)

        assert.is_true(combo:Progress(abilityColdSnap))
        assert.are.same({13.5, 11.25}, combo.waitQueue)

        assert.is_true(combo:Progress(abilitySunStrike))
        assert.are.same({13.5, 11.25, 12.6}, combo.waitQueue)
      end)
    end)

    describe("with invalid abilities", function()
      local invalidAbility = create("ability", {name = "invalid", AbilityDuration = 0.5})

      it("does NOT progress the combo", function()
        assert.is_false(combo.started)
        assert.is_false(combo.failed)
        assert.is_false(combo.preFinished)
        assert.is_false(combo.finished)
        assert.are.equal(0, combo.count)
        assert.are.same({}, combo.waitQueue)
        assert.spy(combo.clock).was_not_called()
        assert.is_nil(combo:CurrentStep())
        assert.is_nil(combo:CurrentStepId())
        assert.are.same({1}, combo:NextStepsIds())
        assert.are.same({1}, stepsIds(combo:NextSteps()))

        assert.is_false(combo:Progress(invalidAbility))

        assert.is_false(combo.started)
        assert.is_false(combo.failed)
        assert.is_false(combo.preFinished)
        assert.is_false(combo.finished)
        assert.are.equal(0, combo.count)
        assert.are.same({}, combo.waitQueue)
        assert.spy(combo.clock).was_not_called()
        assert.is_nil(combo:CurrentStep())
        assert.is_nil(combo:CurrentStepId())
        assert.are.same({1}, combo:NextStepsIds())
        assert.are.same({1}, stepsIds(combo:NextSteps()))

        assert.is_true(combo:Progress(ability1))

        assert.is_true(combo.started)
        assert.is_false(combo.failed)
        assert.is_false(combo.preFinished)
        assert.is_false(combo.finished)
        assert.are.equal(1, combo.count)
        assert.are.same({10.5}, combo.waitQueue)
        assert.spy(combo.clock).was_called(2)
        assert.are.same(1, combo:CurrentStep().id)
        assert.are.equal(1, combo:CurrentStepId())
        assert.are.same({2, 3}, combo:NextStepsIds())
        assert.are.same({2, 3}, stepsIds(combo:NextSteps()))

        assert.is_false(combo:Progress(invalidAbility))

        assert.is_true(combo.started)
        assert.is_false(combo.failed)
        assert.is_false(combo.preFinished)
        assert.is_false(combo.finished)
        assert.are.equal(1, combo.count)
        assert.are.same({10.5}, combo.waitQueue)
        assert.spy(combo.clock).was_called(2)
        assert.are.same(1, combo:CurrentStep().id)
        assert.are.equal(1, combo:CurrentStepId())
        assert.are.same({2, 3}, combo:NextStepsIds())
        assert.are.same({2, 3}, stepsIds(combo:NextSteps()))
      end)
    end)
  end)

  describe("#Fail", function()
    it("flags the combo as failed", function()
      assert.is_false(combo.failed)
      combo:Fail()
      assert.is_true(combo.failed)
    end)
  end)

  describe("#PreFinish", function()
    it("advances the combo to pre-finished state", function()
      assert.is_false(combo:PreFinish())
      assert.is_false(combo.preFinished)
      assert.is_true(combo:Progress(ability1))
      assert.is_false(combo:PreFinish())
      assert.is_false(combo.preFinished)
      assert.is_true(combo:Progress(ability2))
      assert.is_false(combo:PreFinish())
      assert.is_false(combo.preFinished)
      assert.is_true(combo:Progress(ability3))
      assert.is_true(combo:PreFinish())
      assert.is_true(combo.preFinished)
    end)

    it("sets the wait times", function()
      assert.is_true(combo:Progress(ability1))
      assert.is_true(combo:Progress(ability2))
      assert.is_true(combo:Progress(ability3))
      assert.is_true(combo:PreFinish())
      assert.are.equal(10.5, combo.waitTime)
      assert.are.equal(0.5, combo.waitDuration)
    end)
  end)

  describe("#Finish", function()
    it("advances the combo to finished state", function()
      assert.is_false(combo:Finish())
      assert.is_false(combo.finished)
      assert.is_true(combo:Progress(ability1))
      assert.is_false(combo:Finish())
      assert.is_false(combo.finished)
      assert.is_true(combo:Progress(ability2))
      assert.is_false(combo:Finish())
      assert.is_false(combo.finished)
      assert.is_true(combo:Progress(ability3))
      assert.is_false(combo:Finish())
      assert.is_false(combo.finished)
      assert.is_true(combo:PreFinish())
      assert.is_true(combo:Finish())
      assert.is_true(combo.finished)
    end)

    it("sets the combo duration", function()
      local clockIdx = 0
      local function incrClock()
        clockIdx = clockIdx + 1
        return clockIdx
      end

      combo = Combo(SPEC, {clock = incrClock})

      assert.is_true(combo:Progress(ability1))
      assert.is_true(combo:Progress(ability2))
      assert.is_true(combo:Progress(ability3))
      assert.is_true(combo:PreFinish())
      assert.is_true(combo:Finish())
      assert.are.equal(7, combo.duration)
    end)
  end)

  describe("#IncrementDamage", function()
    it("increments the damage accumulator and returns the accumulated value", function()
      assert.are.equal(13, combo:IncrementDamage(13))
      assert.are.equal(13, combo.damage)
      assert.are.equal(44, combo:IncrementDamage(31))
      assert.are.equal(44, combo.damage)
    end)
  end)
end)

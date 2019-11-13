local m = require("moses")

local Talents = require("invokation.dota2.talents")
local BaseCombo = require("invokation.combos.BaseCombo")

local SPEC = {
  id = 13,
  specialty = "qw",
  stance = "defensive",
  heroLevel = 25,
  damageRating = 5,
  difficultyRating = 5,
  gold = 1234,
  tags = { "late-game" },
  items = { "item_blink" },
  orbs = { 7, 7, 7 },
  talents = Talents.Select(
    Talents.L10_LEFT,
    Talents.L15_RIGHT,
    Talents.L20_RIGHT,
    Talents.L25_RIGHT
  ),
}

describe("BaseCombo", function()
  local combo

  before_each(function()
    combo = BaseCombo(SPEC)
  end)

  describe("constructor", function()
    it("initializes attributes", function()
      for key, value in pairs(SPEC) do
        assert.are.same(value, combo[key])
      end

      assert.is_false(combo.started)
      assert.is_false(combo.failed)
      assert.is_false(combo.finished)
      assert.are.equal(0, combo.count)
      assert.are.equal(0, combo.damage)
    end)
  end)

  describe("#CurrentStepId", function()
    it("raises an error", function()
      local fn = m.partial(combo.CurrentStepId, combo)
      assert.has_error(fn, BaseCombo.ERR_NOT_IMPLEMENTED)
    end)
  end)

  describe("#CurrentStep", function()
    it("raises an error", function()
      local fn = m.partial(combo.CurrentStep, combo)
      assert.has_error(fn, BaseCombo.ERR_NOT_IMPLEMENTED)
    end)
  end)

  describe("#NextStepsIds", function()
    it("raises an error", function()
      local fn = m.partial(combo.NextStepsIds, combo)
      assert.has_error(fn, BaseCombo.ERR_NOT_IMPLEMENTED)
    end)
  end)

  describe("#NextSteps", function()
    it("raises an error", function()
      local fn = m.partial(combo.NextSteps, combo)
      assert.has_error(fn, BaseCombo.ERR_NOT_IMPLEMENTED)
    end)
  end)

  describe("#Progress", function()
    it("raises an error", function()
      local fn = m.partial(combo.Progress, combo, {})
      assert.has_error(fn, BaseCombo.ERR_NOT_IMPLEMENTED)
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
    it("raises an error", function()
      local fn = m.partial(combo.PreFinish, combo)
      assert.has_error(fn, BaseCombo.ERR_NOT_IMPLEMENTED)
      assert.is_false(combo.preFinished)
    end)
  end)

  describe("#Finish", function()
    it("raises an error", function()
      local fn = m.partial(combo.Finish, combo)
      assert.has_error(fn, BaseCombo.ERR_NOT_IMPLEMENTED)
      assert.is_false(combo.finished)
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

local BaseCombo = require("invokation.combos.BaseCombo")
local FreestyleCombo = require("invokation.combos.FreestyleCombo")

describe("FreestyleCombo", function()
  local combo

  before_each(function()
    combo = FreestyleCombo()
  end)

  it("inherits from BaseCombo", function()
    assert.is_true(BaseCombo:class_of(combo))
  end)

  describe("constructor", function()
    it("initializes attributes", function()
      assert.are.equal(FreestyleCombo.COMBO_ID, combo.id)
      assert.is_true(combo.started)
      assert.is_false(combo.failed)
      assert.is_false(combo.finished)
      assert.are.equal(0, combo.count)
      assert.are.equal(0, combo.damage)
    end)
  end)

  describe("#CurrentStepId", function()
    local ability = { IsInvocationAbility = function()
      return false
    end }

    it("always returns nil", function()
      assert.is_nil(combo:CurrentStepId())
      assert.is_true(combo:Progress(ability))
      assert.is_nil(combo:CurrentStepId())
    end)
  end)

  describe("#CurrentStep", function()
    local ability = { IsInvocationAbility = function()
      return false
    end }

    it("always returns nil", function()
      assert.is_nil(combo:CurrentStep())
      assert.is_true(combo:Progress(ability))
      assert.is_nil(combo:CurrentStep())
    end)
  end)

  describe("#NextStepsIds", function()
    local ability = { IsInvocationAbility = function()
      return false
    end }

    it("always returns an empty array", function()
      assert.is.same({}, combo:NextStepsIds())
      assert.is_true(combo:Progress(ability))
      assert.is.same({}, combo:NextStepsIds())
    end)
  end)

  describe("#NextSteps", function()
    local ability = { IsInvocationAbility = function()
      return false
    end }

    it("always returns an empty array", function()
      assert.is.same({}, combo:NextSteps())
      assert.is_true(combo:Progress(ability))
      assert.is.same({}, combo:NextSteps())
    end)
  end)

  describe("#Progress", function()
    describe("with invocation ability", function()
      local ability = { IsInvocationAbility = spy.new(function()
        return true
      end) }

      before_each(function()
        ability.IsInvocationAbility:clear()
      end)

      it("returns false", function()
        assert.is_false(combo:Progress(ability))
        assert.spy(ability.IsInvocationAbility).was_called(1)
      end)

      it("does not update counter", function()
        assert.is_false(combo:Progress(ability))
        assert.spy(ability.IsInvocationAbility).was_called(1)
        assert.are.equal(0, combo.count)
      end)
    end)

    describe("with non-invocation ability", function()
      local ability = { IsInvocationAbility = spy.new(function()
        return false
      end) }

      before_each(function()
        ability.IsInvocationAbility:clear()
      end)

      it("returns true", function()
        assert.is_true(combo:Progress(ability))
        assert.spy(ability.IsInvocationAbility).was_called(1)
      end)

      it("increments counter", function()
        assert.is_true(combo:Progress(ability))
        assert.are.equal(1, combo.count)

        assert.is_true(combo:Progress(ability))
        assert.are.equal(2, combo.count)

        assert.is_true(combo:Progress(ability))
        assert.are.equal(3, combo.count)

        assert.spy(ability.IsInvocationAbility).was_called(3)
      end)
    end)
  end)

  describe("#Fail", function()
    local ability = { IsInvocationAbility = function()
      return true
    end }

    it("is a no-op", function()
      assert.is_false(combo.failed)
      assert.is_nil(combo:Fail())
      assert.is_false(combo.failed)
      assert.is_false(combo:Progress(ability))
      assert.is_nil(combo:Fail())
      assert.is_false(combo.failed)
    end)
  end)

  describe("#PreFinish", function()
    local ability = { IsInvocationAbility = function()
      return false
    end }

    it("always returns false", function()
      assert.is_false(combo:PreFinish())
      assert.is_false(combo.preFinished)
      assert.is_true(combo:Progress(ability))
      assert.is_false(combo:PreFinish())
      assert.is_false(combo.preFinished)
      assert.is_true(combo:Progress(ability))
      assert.is_false(combo:PreFinish())
      assert.is_false(combo.preFinished)
    end)
  end)

  describe("#Finish", function()
    local ability = { IsInvocationAbility = function()
      return false
    end }

    it("always returns false", function()
      assert.is_false(combo:Finish())
      assert.is_false(combo.finished)
      assert.is_true(combo:Progress(ability))
      assert.is_false(combo:Finish())
      assert.is_false(combo.finished)
      assert.is_true(combo:Progress(ability))
      assert.is_false(combo:Finish())
      assert.is_false(combo.finished)
      assert.is_false(combo:PreFinish())
      assert.is_false(combo:Finish())
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

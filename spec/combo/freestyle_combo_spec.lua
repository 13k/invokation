local assert = require("luassert")

local BaseCombo = require("invk.combo.base_combo")
local FreestyleCombo = require("invk.combo.freestyle_combo")

local State = BaseCombo.State

describe("invk.combo.FreestyleCombo", function()
  --- @type invk.combo.FreestyleCombo
  local combo

  before_each(function()
    combo = FreestyleCombo:new()
  end)

  it("inherits from BaseCombo", function()
    assert.is_true(FreestyleCombo:isSubclassOf(BaseCombo))
    assert.is_true(combo:isInstanceOf(BaseCombo))
  end)

  describe("constructor", function()
    it("initializes attributes", function()
      assert.equal(BaseCombo.FREESTYLE_COMBO_ID, combo.id)
      assert.equal(State.Started, combo.state)
      assert.equal(0, combo.metrics.count)
      assert.equal(0, combo.metrics.damage)
      assert.equal(0, combo.metrics.duration)
    end)
  end)

  describe(":current_step_id", function()
    local ability = {
      is_invocation_ability = function()
        return false
      end,
    }

    it("always returns nil", function()
      assert.is_nil(combo:current_step_id())
      assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
      assert.is_nil(combo:current_step_id())
    end)
  end)

  describe(":current_step", function()
    local ability = {
      is_invocation_ability = function()
        return false
      end,
    }

    it("always returns nil", function()
      assert.is_nil(combo:current_step())
      assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
      assert.is_nil(combo:current_step())
    end)
  end)

  describe(":next_steps_ids", function()
    local ability = {
      is_invocation_ability = function()
        return false
      end,
    }

    it("always returns an empty array", function()
      assert.same({}, combo:next_steps_ids())
      assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
      assert.same({}, combo:next_steps_ids())
    end)
  end)

  describe(":next_steps", function()
    local ability = {
      is_invocation_ability = function()
        return false
      end,
    }

    it("always returns an empty array", function()
      assert.same({}, combo:next_steps())
      assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
      assert.same({}, combo:next_steps())
    end)
  end)

  describe(":progress", function()
    describe("with invocation ability", function()
      local ability = {
        is_invocation_ability = spy.new(function()
          return true
        end),
      }

      before_each(function()
        ability.is_invocation_ability:clear()
      end)

      it("returns false", function()
        assert.is_false(combo:progress(ability --[[@as invk.dota2.Ability]]))
        assert.spy(ability.is_invocation_ability).called(1)
      end)

      it("does not update counter", function()
        assert.is_false(combo:progress(ability --[[@as invk.dota2.Ability]]))
        assert.spy(ability.is_invocation_ability).called(1)
        assert.equal(0, combo.metrics.count)
      end)
    end)

    describe("with non-invocation ability", function()
      local ability = {
        is_invocation_ability = spy.new(function()
          return false
        end),
      }

      before_each(function()
        ability.is_invocation_ability:clear()
      end)

      it("returns true", function()
        assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
        assert.spy(ability.is_invocation_ability).called(1)
      end)

      it("increments counter", function()
        assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
        assert.equal(1, combo.metrics.count)

        assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
        assert.equal(2, combo.metrics.count)

        assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
        assert.equal(3, combo.metrics.count)

        assert.spy(ability.is_invocation_ability).called(3)
      end)
    end)
  end)

  describe(":fail", function()
    local ability = {
      is_invocation_ability = function()
        return true
      end,
    }

    it("is a no-op", function()
      assert.are_not_equal(State.Failed, combo.state)
      assert.is_nil(combo:fail())
      assert.are_not_equal(State.Failed, combo.state)
      assert.is_false(combo:progress(ability --[[@as invk.dota2.Ability]]))
      assert.is_nil(combo:fail())
      assert.are_not_equal(State.Failed, combo.state)
    end)
  end)

  describe(":pre_finish", function()
    local ability = {
      is_invocation_ability = function()
        return false
      end,
    }

    it("always returns false", function()
      assert.are_not_equal(State.PreFinished, combo.state)
      assert.is_false(combo:pre_finish())
      assert.are_not_equal(State.PreFinished, combo.state)
      assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
      assert.is_false(combo:pre_finish())
      assert.are_not_equal(State.PreFinished, combo.state)
      assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
      assert.is_false(combo:pre_finish())
      assert.are_not_equal(State.PreFinished, combo.state)
    end)
  end)

  describe(":finish", function()
    local ability = {
      is_invocation_ability = function()
        return false
      end,
    }

    it("always returns false", function()
      assert.is_false(combo:finish())
      assert.are_not_equal(State.Finished, combo.state)
      assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
      assert.is_false(combo:finish())
      assert.are_not_equal(State.Finished, combo.state)
      assert.is_true(combo:progress(ability --[[@as invk.dota2.Ability]]))
      assert.is_false(combo:finish())
      assert.are_not_equal(State.Finished, combo.state)
      assert.is_false(combo:pre_finish())
      assert.is_false(combo:finish())
      assert.are_not_equal(State.Finished, combo.state)
    end)
  end)
end)

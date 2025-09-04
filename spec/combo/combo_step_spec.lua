local assert = require("luassert")

local ComboStep = require("invk.combo.combo_step")

describe("invk.combo.ComboStep", function()
  --- @type invk.combo.ComboStepSpec
  local data = {
    id = 1,
    name = "step_name",
    required = true,
    next = { 2, 3 },
  }

  --- @type invk.combo.ComboStep
  local step

  before_each(function()
    step = ComboStep:new(data)
  end)

  describe(".gen_state_name", function()
    it("generates a state name", function()
      assert.equal("1:step_name", ComboStep.gen_state_name(step))

      step.id = 2

      assert.equal("2:step_name", ComboStep.gen_state_name(step))

      step.id = 3
      step.name = "another_step"

      assert.equal("3:another_step", ComboStep.gen_state_name(step))
    end)
  end)

  describe(".gen_event_name", function()
    it("generates an event name", function()
      assert.equal("step_name", ComboStep.gen_event_name(step))

      step.name = "another_step"

      assert.equal("another_step", ComboStep.gen_event_name(step))
    end)
  end)

  describe(".extract_step_id", function()
    describe("with valid state name", function()
      it("extracts a numeric step id from a state name", function()
        assert.equal(13, ComboStep.extract_step_id("13:step_name"))
        assert.equal(31, ComboStep.extract_step_id("31:another_step"))
        assert.equal(44, ComboStep.extract_step_id("44:yet_another_step"))
      end)
    end)

    describe("with an invalid state name", function()
      it("returns nil", function()
        assert.is_nil(ComboStep.extract_step_id("invalid_state_name"))
        assert.is_nil(ComboStep.extract_step_id("invalid:state_name"))
        assert.is_nil(ComboStep.extract_step_id("0.5:state_name"))
      end)
    end)
  end)

  describe("constructor", function()
    it("initializes attributes", function()
      assert.equal(ComboStep.gen_state_name(step), step.state)
      assert.equal(ComboStep.gen_event_name(step), step.event)
    end)
  end)
end)

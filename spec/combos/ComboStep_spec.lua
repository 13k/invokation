local ComboStep = require("invokation.combos.ComboStep")

describe("ComboStep", function()
  local data = {id = 1, name = "step_name", required = true, next = {2, 3}}

  local step

  before_each(function()
    step = ComboStep(data)
  end)

  describe(".StateName", function()
    it("generates a state name", function()
      assert.are.equal("1:step_name", ComboStep.StateName(step))

      step.id = 2

      assert.are.equal("2:step_name", ComboStep.StateName(step))

      step.id = 3
      step.name = "another_step"

      assert.are.equal("3:another_step", ComboStep.StateName(step))
    end)
  end)

  describe(".EventName", function()
    it("generates an event name", function()
      assert.are.equal("step_name", ComboStep.EventName(step))

      step.name = "another_step"

      assert.are.equal("another_step", ComboStep.EventName(step))
    end)
  end)

  describe(".StepId", function()
    describe("with valid state name", function()
      it("extracts a numeric step id from a state name", function()
        assert.are.equal(13, ComboStep.StepId("13:step_name"))
        assert.are.equal(31, ComboStep.StepId("31:another_step"))
        assert.are.equal(44, ComboStep.StepId("44:yet_another_step"))
      end)
    end)

    describe("with an invalid state name", function()
      it("returns nil", function()
        assert.is_nil(ComboStep.StepId("invalid_state_name"))
        assert.is_nil(ComboStep.StepId("invalid:state_name"))
        assert.is_nil(ComboStep.StepId("0.5:state_name"))
      end)
    end)
  end)

  describe("constructor", function()
    it("initializes attributes", function()
      assert.are.equal(ComboStep.StateName(step), step.state)
      assert.are.equal(ComboStep.EventName(step), step.event)
    end)
  end)
end)

local assert = require("luassert")

local F = require("support.factory")

local BaseCombo = require("invk.combo.base_combo")
local S = require("invk.combo.spec")
local talents = require("invk.dota2.talents")

--- @type invk.combo.ComboSpec
local SPEC = {
  id = 13,
  specialty = S.Specialty.QuasWex,
  stance = S.Stance.Defensive,
  damage_rating = 5,
  difficulty_rating = 5,
  hero_level = 25,
  orbs = { 7, 7, 7 },
  gold = 1234,
  items = { "item_blink" },
  tags = { "late-game" },
  talents = talents.select(
    talents.Talents.L10_LEFT,
    talents.Talents.L15_RIGHT,
    talents.Talents.L20_RIGHT,
    talents.Talents.L25_RIGHT
  ),
  sequence = {},
}

describe("invk.combo.BaseCombo", function()
  --- @type invk.combo.BaseCombo
  local combo

  before_each(function()
    combo = BaseCombo:new(SPEC)
  end)

  describe("constructor", function()
    it("initializes attributes", function()
      for key, value in pairs(SPEC) do
        assert.same(value, combo[key])
      end

      assert.equal(BaseCombo.State.Initial, combo.state)
      assert.equal(0, combo.metrics.count)
      assert.equal(0, combo.metrics.damage)
      assert.equal(0, combo.metrics.duration)
    end)
  end)

  describe(":current_step_id", function()
    it("raises an error", function()
      assert.error(function()
        combo:current_step_id()
      end, "Not implemented")
    end)
  end)

  describe(":current_step", function()
    it("raises an error", function()
      assert.error(function()
        combo:current_step()
      end, "Not implemented")
    end)
  end)

  describe(":next_steps_ids", function()
    it("raises an error", function()
      assert.error(function()
        combo:next_steps_ids()
      end, "Not implemented")
    end)
  end)

  describe(":next_steps", function()
    it("raises an error", function()
      assert.error(function()
        combo:next_steps()
      end, "Not implemented")
    end)
  end)

  describe(":progress", function()
    it("raises an error", function()
      assert.error(function()
        local ability = F.ability({ name = "step1" })

        combo:progress(ability)
      end, "Not implemented")
    end)
  end)

  describe(":fail", function()
    it("flags the combo as failed", function()
      assert.equal(BaseCombo.State.Initial, combo.state)

      combo:fail()

      assert.equal(BaseCombo.State.Failed, combo.state)
    end)
  end)

  describe(":pre_finish", function()
    it("raises an error", function()
      assert.error(function()
        combo:pre_finish()
      end, "Not implemented")

      assert.equal(BaseCombo.State.Initial, combo.state)
    end)
  end)

  describe(":finish", function()
    it("raises an error", function()
      assert.error(function()
        combo:finish()
      end, "Not implemented")

      assert.equal(BaseCombo.State.Initial, combo.state)
    end)
  end)

  describe(":increment_damage", function()
    it("increments the damage accumulator and returns the accumulated value", function()
      assert.equal(13, combo:increment_damage(13))
      assert.equal(13, combo.metrics.damage)
      assert.equal(44, combo:increment_damage(31))
      assert.equal(44, combo.metrics.damage)
    end)
  end)
end)

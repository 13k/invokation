local assert = require("luassert")

local F = require("support.factory")

local Ability = require("invk.dota2.ability")
local INVOKER = require("invk.const.invoker")

local AbilityName = INVOKER.AbilityName

describe("inkv.dota2.Ability", function()
  describe("constructor", function()
    it("initializes attributes", function()
      local entity = F.dota_ability({ name = AbilityName.QUAS, index = 13 })
      local ability = Ability:new(entity)

      assert.equal(AbilityName.QUAS, ability.name)
      assert.equal(13, ability.index)

      entity = F.dota_ability({ name = AbilityName.SUN_STRIKE, index = 31 })
      ability = Ability:new(entity)

      assert.equal(AbilityName.SUN_STRIKE, ability.name)
      assert.equal(31, ability.index)

      entity = F.dota_item({ name = "item_blink" })
      ability = Ability:new(entity)

      assert.equal("item_blink", ability.name)
      assert.equal(nil, ability.index)
    end)
  end)

  describe("delegation", function()
    it("delegates methods to underlying entity", function()
      local entity = F.dota_ability({ name = AbilityName.QUAS, index = 13 })
      local ability = Ability:new(entity)
      local delegated = {
        ["duration"] = "GetDuration",
        ["get_special_value_for"] = "GetSpecialValueFor",
      }

      for ability_method, ent_method in pairs(delegated) do
        local spy = spy.on(entity, ent_method)

        ability[ability_method](ability)

        assert.spy(spy).called(1)
      end
    end)
  end)

  describe(":is_orb_ability", function()
    describe("with item", function()
      it("returns false", function()
        local entity = F.dota_item({ name = "item_blink" })
        local ability = Ability:new(entity)

        assert.is_false(ability:is_orb_ability())
      end)
    end)

    describe("with non-orb ability", function()
      it("returns false", function()
        local entity = F.dota_ability({ name = AbilityName.SUN_STRIKE, index = 13 })
        local ability = Ability:new(entity)

        assert.is_false(ability:is_orb_ability())
      end)
    end)

    describe("with orb ability", function()
      it("returns true", function()
        local entity = F.dota_ability({ name = AbilityName.QUAS, index = 13 })
        local ability = Ability:new(entity)

        assert.is_true(ability:is_orb_ability())
      end)
    end)
  end)

  describe(":is_invocation_ability", function()
    describe("with item", function()
      it("returns false", function()
        local entity = F.dota_item({ name = "item_blink" })
        local ability = Ability:new(entity)

        assert.is_false(ability:is_invocation_ability())
      end)
    end)

    describe("with non-orb ability", function()
      it("returns false", function()
        local entity = F.dota_ability({ name = AbilityName.SUN_STRIKE, index = 13 })
        local ability = Ability:new(entity)

        assert.is_false(ability:is_invocation_ability())
      end)
    end)

    describe("with orb ability", function()
      it("returns true", function()
        local entity = F.dota_ability({ name = AbilityName.QUAS, index = 13 })
        local ability = Ability:new(entity)

        assert.is_true(ability:is_invocation_ability())
      end)
    end)

    describe("with invoke ability", function()
      it("returns true", function()
        local entity = F.dota_ability({ name = AbilityName.INVOKE, index = 1 })
        local ability = Ability:new(entity)

        assert.is_true(ability:is_invocation_ability())
      end)
    end)
  end)
end)

local create = require("support.factory").create

local Ability = require("invokation.dota2.Ability")

local INVOKER = require("invokation.const.invoker")

describe("dota2.Ability", function()
  describe("constructor", function()
    it("initializes attributes", function()
      local entity = create("dota_ability", {name = INVOKER.ABILITY_QUAS, index = 13})
      local ability = Ability(entity)

      assert.are.equal(INVOKER.ABILITY_QUAS, ability.name)
      assert.are.equal(13, ability.index)

      entity = create("dota_ability", {name = INVOKER.ABILITY_SUN_STRIKE, index = 31})
      ability = Ability(entity)

      assert.are.equal(INVOKER.ABILITY_SUN_STRIKE, ability.name)
      assert.are.equal(31, ability.index)

      entity = create("dota_item", {name = "item_blink"})
      ability = Ability(entity)

      assert.are.equal("item_blink", ability.name)
      assert.are.equal(nil, ability.index)
    end)
  end)

  describe("delegation", function()
    it("delegates methods to underlying entity", function()
      local entity = create("dota_ability", {name = INVOKER.ABILITY_QUAS, index = 13})
      local ability = Ability(entity)
      local delegated = {"GetDuration", "GetSpecialValueFor", "IsItem"}

      for _, method in ipairs(delegated) do
        local spy = spy.on(entity, method)

        ability[method](ability)

        assert.spy(spy).was.called(1)
      end
    end)
  end)

  describe("#IsOrbAbility", function()
    describe("with item", function()
      it("returns false", function()
        local entity = create("dota_item", {name = "item_blink"})
        local ability = Ability(entity)

        assert.is_false(ability:IsOrbAbility())
      end)
    end)

    describe("with non-orb ability", function()
      it("returns false", function()
        local entity = create("dota_ability", {name = INVOKER.ABILITY_SUN_STRIKE, index = 13})
        local ability = Ability(entity)

        assert.is_false(ability:IsOrbAbility())
      end)
    end)

    describe("with orb ability", function()
      it("returns true", function()
        local entity = create("dota_ability", {name = INVOKER.ABILITY_QUAS, index = 13})
        local ability = Ability(entity)

        assert.is_true(ability:IsOrbAbility())
      end)
    end)
  end)

  describe("#IsInvocationAbility", function()
    describe("with item", function()
      it("returns false", function()
        local entity = create("dota_item", {name = "item_blink"})
        local ability = Ability(entity)

        assert.is_false(ability:IsInvocationAbility())
      end)
    end)

    describe("with non-orb ability", function()
      it("returns false", function()
        local entity = create("dota_ability", {name = INVOKER.ABILITY_SUN_STRIKE, index = 13})
        local ability = Ability(entity)

        assert.is_false(ability:IsInvocationAbility())
      end)
    end)

    describe("with orb ability", function()
      it("returns true", function()
        local entity = create("dota_ability", {name = INVOKER.ABILITY_QUAS, index = 13})
        local ability = Ability(entity)

        assert.is_true(ability:IsInvocationAbility())
      end)
    end)

    describe("with invoke ability", function()
      it("returns true", function()
        local entity = create("dota_ability", {name = INVOKER.ABILITY_INVOKE, index = 1})
        local ability = Ability(entity)

        assert.is_true(ability:IsInvocationAbility())
      end)
    end)
  end)
end)

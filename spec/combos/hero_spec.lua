local m = require("moses")
local create = require("support.factory").create

local Combo = require("invokation.combos.Combo")
local CombosHero = require("invokation.combos.hero")

local LIMITS = require("invokation.const.limits")
local INVOKER = require("invokation.const.invoker")
local SOUND_EVENTS = require("invokation.const.sound_events")

describe("combos.hero", function()
  describe(".setup", function()
    local combo = Combo({
      id = 13,
      heroLevel = 6,
      gold = 1300,
      items = {
        "item_travel_boots",
        "item_black_king_bar",
        "item_shivas_guard",
        "item_refresher",
        "item_octarine_core",
        "item_ultimate_scepter",
      },
      sequence = { { id = 1, name = "ability" } },
    })

    it("runs the combo setup", function()
      local unit = create("hero_invoker")
      local hero = unit.entity
      local player = create("dota_player", { id = 13, hero = hero })

      CombosHero.setup(player, combo)

      assert.equal(6, hero:GetLevel())
      assert.equal(1300, hero:GetGold())
      assert.same(m.sort(combo.items), unit:ItemNames({ sort = true }))
    end)

    describe("when hero already has some items", function()
      it("gives the hero only the missing items", function()
        local items = { "item_shivas_guard", "item_refresher" }
        local unit = create("hero_invoker", {}, { items = items })
        local player = create("dota_player", { id = 13, hero = unit.entity })

        CombosHero.setup(player, combo)

        assert.same(m.sort(combo.items), unit:ItemNames({ sort = true }))
      end)
    end)
  end)

  describe(".teardown", function()
    it("stops currently playing sounds on the hero", function()
      local hero = create("dota_hero_invoker")
      local player = create("dota_player", { id = 13, hero = hero })
      local spyStopSound = spy.on(hero, "StopSound")

      CombosHero.teardown(player)

      assert.spy(spyStopSound).was.self.called_with(SOUND_EVENTS.SNDEVT_INVOKER_METEOR_LOOP)
    end)

    it("resets hero abilities cooldowns", function()
      local unit = create("hero_invoker")
      local player = create("dota_player", { id = 13, hero = unit.entity })
      local spies = {}

      unit:ForEachAbility(function(ability)
        spies[ability:GetAbilityName()] = { EndCooldown = spy.on(ability, "EndCooldown") }
      end)

      assert.is_false(m.isEmpty(spies))

      CombosHero.teardown(player)

      for _, s in pairs(spies) do
        assert.spy(s.EndCooldown).was.self.called()
      end
    end)

    it("resets hero items cooldowns", function()
      local items = { "item_shivas_guard", "item_refresher" }
      local unit = create("hero_invoker", {}, { items = items })
      local hero = unit.entity

      assert.is_false(m.isEmpty(hero.inventory))

      local player = create("dota_player", { id = 13, hero = hero })
      local spies = {}

      unit:ForEachItem(function(item)
        spies[item:GetAbilityName()] = { EndCooldown = spy.on(item, "EndCooldown") }
      end)

      assert.is_false(m.isEmpty(spies))

      CombosHero.teardown(player)

      for _, s in pairs(spies) do
        assert.spy(s.EndCooldown).was.self.called()
      end
    end)

    describe("with dropped items", function()
      local hero = create("dota_hero_invoker")
      local player = create("dota_player", { id = 13, hero = hero })
      local items = {
        create("dota_item", { name = "item_blink", purchaser = hero }),
        create("dota_item", { name = "item_refresher", purchaser = hero }),
        create("dota_item", { name = "item_travel_boots", purchaser = hero }),
      }

      before_each(function()
        stub.new(GameRules, "NumDroppedItems", #items)
        stub.new(GameRules, "GetDroppedItem", function(_, i)
          return items[i + 1]
        end)
      end)

      after_each(function()
        -- selene: allow(incorrect_standard_library_use)
        GameRules.NumDroppedItems:revert()
        -- selene: allow(incorrect_standard_library_use)
        GameRules.GetDroppedItem:revert()
      end)

      it("removes dropped items owned by the hero", function()
        local itemSpies = m.map(items, function(item)
          return item, { RemoveSelf = spy.on(item, "RemoveSelf") }
        end)

        CombosHero.teardown(player)

        for item, spies in pairs(itemSpies) do
          assert.spy(spies.RemoveSelf).was.self.called()
          assert.is_true(item:IsNull())
        end
      end)
    end)

    describe("with spawned units by the hero", function()
      local hero = create("dota_hero_invoker")
      local player = create("dota_player", { id = 13, hero = hero })
      local units = {}
      local unitSpies = {}

      for _, name in pairs(INVOKER.SPAWNED_UNITS) do
        for _ = 0, 1 do
          local unit = create("dota_unit", { name = name, playerOwner = player })

          units[name] = units[name] or {}

          table.insert(units[name], unit)

          unitSpies[name] = unitSpies[name] or {}
          unitSpies[name][unit] = { RemoveSelf = spy.on(unit, "RemoveSelf") }
        end
      end

      before_each(function()
        stub.new(Entities, "FindByName", function(_, startEnt, name)
          local entIdx = startEnt and startEnt:GetEntityIndex() or 0

          local unitIdx = m.findIndex(units[name], function(unit)
            return unit:GetEntityIndex() > entIdx
          end)

          return units[name][unitIdx]
        end)
      end)

      after_each(function()
        -- selene: allow(incorrect_standard_library_use)
        Entities.FindByName:revert()
      end)

      it("removes spawned units by the hero", function()
        CombosHero.teardown(player)

        for _, group in pairs(unitSpies) do
          for unit, spies in pairs(group) do
            assert.spy(spies.RemoveSelf).was.self.called_with()
            assert.is_true(unit:IsNull())
          end
        end
      end)
    end)

    describe("with soft reset", function()
      it("purges the hero", function()
        local hero = create("dota_hero_invoker")
        local player = create("dota_player", { id = 13, hero = hero })
        local spyHeroPurge = spy.on(hero, "Purge")

        CombosHero.teardown(player)

        assert.spy(spyHeroPurge).was.self.called_with(true, true, false, true, true)
      end)

      it("heals the hero to max health", function()
        local hero = create("dota_hero_invoker", { maxHealth = 1000.0, health = 301.25 })
        local player = create("dota_player", { id = 13, hero = hero })

        assert.equal(301.25, hero:GetHealth())

        CombosHero.teardown(player)

        assert.equal(1000.0, hero:GetHealth())
      end)

      it("gives the hero max mana", function()
        local hero = create("dota_hero_invoker", { maxMana = 1000.0, mana = 301.25 })
        local player = create("dota_player", { id = 13, hero = hero })

        assert.equal(301.25, hero:GetMana())

        CombosHero.teardown(player)

        assert.equal(1000.0, hero:GetMana())
      end)
    end)

    describe("with hard reset", function()
      before_each(function()
        stub.new(PlayerResource, "ReplaceHeroWith")
      end)

      after_each(function()
        -- selene: allow(incorrect_standard_library_use)
        PlayerResource.ReplaceHeroWith:revert()
      end)

      it("removes all hero's items", function()
        local items = { "item_shivas_guard", "item_refresher" }
        local hero = create("dota_hero_invoker", {}, { items = items })
        local player = create("dota_player", { id = 13, hero = hero })

        CombosHero.teardown(player, { hardReset = true })

        assert.same({}, hero.inventory)
      end)

      it("resets hero abilities", function()
        local abilities = {
          [INVOKER.ABILITY_QUAS] = 7,
          [INVOKER.ABILITY_WEX] = 4,
          [INVOKER.ABILITY_EXORT] = 6,
          [INVOKER.ABILITY_COLD_SNAP] = 1,
          [INVOKER.ABILITY_SUN_STRIKE] = 1,
          [INVOKER.ABILITY_TALENT_L10_RIGHT] = 1,
          [INVOKER.ABILITY_TALENT_L10_LEFT] = 0,
          [INVOKER.ABILITY_TALENT_L15_RIGHT] = 1,
          [INVOKER.ABILITY_TALENT_L15_LEFT] = 0,
          [INVOKER.ABILITY_TALENT_L20_RIGHT] = 1,
          [INVOKER.ABILITY_TALENT_L20_LEFT] = 0,
          [INVOKER.ABILITY_TALENT_L25_RIGHT] = 1,
          [INVOKER.ABILITY_TALENT_L25_LEFT] = 0,
        }

        local hero = create("dota_hero_invoker", {}, { abilities = abilities })
        local player = create("dota_player", { id = 13, hero = hero })

        CombosHero.teardown(player, { hardReset = true })

        for _, name in ipairs(INVOKER.ORB_ABILITIES) do
          assert.equal(0, hero:FindAbilityByName(name):GetLevel())
        end

        for _, name in ipairs(INVOKER.TALENT_ABILITIES) do
          assert.equal(0, hero:FindAbilityByName(name):GetLevel())
        end

        assert.equal(1, hero:FindAbilityByName(INVOKER.ABILITY_COLD_SNAP):GetLevel())
        assert.equal(1, hero:FindAbilityByName(INVOKER.ABILITY_SUN_STRIKE):GetLevel())
        assert.equal(1, hero:GetAbilityPoints())
      end)

      it("replaces hero with a new one", function()
        local hero = create("dota_hero_invoker")
        local player = create("dota_player", { id = 13, hero = hero })
        local spyHeroRemoveSelf = spy.on(hero, "RemoveSelf")

        CombosHero.teardown(player, { hardReset = true })

        assert.stub(PlayerResource.ReplaceHeroWith).was.self.called_with(13, INVOKER.UNIT_NAME, 0, 0)

        assert.spy(spyHeroRemoveSelf).was.self.called()
        assert.is_true(hero:IsNull())
      end)
    end)
  end)

  describe(".refundPurchase", function()
    it("refunds a purchase", function()
      local hero = create("dota_hero_invoker")
      local player = create("dota_player", { id = 13, hero = hero })
      local purchase = { item = "item_blink", cost = 1234.5 }

      hero:SetGold(0, true)
      hero:SetGold(0, false)

      assert.equal(0, hero:GetGold())

      CombosHero.refundPurchase(player, purchase)

      assert.equal(1234.5, hero:GetGold())
    end)
  end)

  describe(".levelUp", function()
    local abilities = {
      [INVOKER.ABILITY_QUAS] = 1,
      [INVOKER.ABILITY_WEX] = 1,
      [INVOKER.ABILITY_EXORT] = 1,
      [INVOKER.ABILITY_COLD_SNAP] = 1,
      [INVOKER.ABILITY_SUN_STRIKE] = 1,
    }

    local hero, player

    before_each(function()
      hero = create("dota_hero_invoker", { level = 3, abilityPoints = 0 }, { abilities = abilities })
      player = create("dota_player", { id = 13, hero = hero })
    end)

    describe("with specific level option", function()
      it("levels up the player hero to the specified level", function()
        assert.equal(3, hero:GetLevel())
        assert.equal(0, hero:GetAbilityPoints())

        CombosHero.levelUp(player, { level = 6 })

        assert.equal(6, hero:GetLevel())
        assert.equal(3, hero:GetAbilityPoints())
      end)
    end)

    describe("with empty level option", function()
      it("levels up the player hero by one level", function()
        assert.equal(3, hero:GetLevel())
        assert.equal(0, hero:GetAbilityPoints())

        CombosHero.levelUp(player)

        assert.equal(4, hero:GetLevel())
        assert.equal(1, hero:GetAbilityPoints())
      end)
    end)

    describe("with maxLevel option", function()
      it("levels up the player hero, abilities and talents to max level", function()
        assert.equal(3, hero:GetLevel())
        assert.equal(0, hero:GetAbilityPoints())

        CombosHero.levelUp(player, { maxLevel = true })

        assert.equal(LIMITS.MAX_HERO_LEVEL, hero:GetLevel())
        assert.equal(0, hero:GetAbilityPoints())

        for _, name in ipairs(INVOKER.ORB_ABILITIES) do
          local ability = hero:FindAbilityByName(name)
          assert.equal(ability:GetMaxLevel(), ability:GetLevel())
        end

        for _, name in ipairs(INVOKER.TALENT_ABILITIES) do
          local ability = hero:FindAbilityByName(name)
          assert.equal(ability:GetMaxLevel(), ability:GetLevel())
        end

        assert.equal(1, hero:FindAbilityByName(INVOKER.ABILITY_COLD_SNAP):GetLevel())
        assert.equal(1, hero:FindAbilityByName(INVOKER.ABILITY_SUN_STRIKE):GetLevel())
      end)
    end)
  end)
end)

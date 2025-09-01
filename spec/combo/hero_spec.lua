local assert = require("luassert")
local m = require("moses")
local spy = require("luassert.spy")

local F = require("support.factory")
local Mock = require("support.mock")
local dota2_h = require("support.dota2.helpers")

local Combo = require("invk.combo.combo")
local INVOKER = require("invk.const.invoker")
local LIMITS = require("invk.const.limits")
local S = require("invk.combo.spec")
local SOUND_EVENTS = require("invk.const.sound_events")
local combo_hero = require("invk.combo.hero")
local talents = require("invk.dota2.talents")

local AbilityName = INVOKER.AbilityName
local Talents = talents.Talents

describe("invk.combo.hero", function()
  describe(".setup", function()
    --- @type invk.combo.ComboSpec
    local combo_spec = {
      id = 13,
      specialty = S.Specialty.QuasWex,
      stance = S.Stance.Defensive,
      damage_rating = S.DamageRating.Brutal,
      difficulty_rating = S.DifficultyRating.LiterallyUnplayable,
      hero_level = 6,
      orbs = { 7, 7, 7 },
      talents = talents.select(
        Talents.L10_LEFT,
        Talents.L15_RIGHT,
        Talents.L20_RIGHT,
        Talents.L25_RIGHT
      ),
      gold = 1300,
      items = {
        "item_travel_boots",
        "item_black_king_bar",
        "item_shivas_guard",
        "item_refresher",
        "item_octarine_core",
        "item_ultimate_scepter",
      },
      tags = { "testing" },
      sequence = {
        { id = 1, name = "ability" },
      },
    }

    local combo = Combo:new(combo_spec)

    it("runs the combo setup", function()
      local unit = F.hero_invoker()
      local hero = unit.entity --[[@as support.dota2.CDOTA_BaseNPC_Hero]]
      local player = F.dota_player({ hero = hero })

      combo_hero.setup(player, combo)

      assert.equal(6, hero:GetLevel())
      assert.equal(1300, hero:GetGold())
      assert.same(m.sort(combo.items), unit:item_names({ sort = true }))
    end)

    describe("when hero already has some items", function()
      it("gives the hero only the missing items", function()
        local unit = F.hero_invoker(nil, { items = { "item_shivas_guard", "item_refresher" } })
        local player = F.dota_player({ hero = unit.entity })

        combo_hero.setup(player, combo)

        assert.same(m.sort(combo.items), unit:item_names({ sort = true }))
      end)
    end)
  end)

  describe(".teardown", function()
    local mocks = Mock()
    --- @type CDOTA_Item[]
    local dropped_items = {}

    before_each(function()
      dropped_items = {}

      mocks:stub("GameRules", GameRules, "NumDroppedItems", function()
        return #dropped_items
      end)

      mocks:stub("GameRules", GameRules, "GetDroppedItem", function(_, i)
        return dropped_items[i + 1]
      end)
    end)

    after_each(function()
      mocks:reset()
    end)

    it("stops currently playing sounds on the hero", function()
      local hero = F.dota_hero_invoker()
      local player = F.dota_player({ hero = hero })

      mocks:spy("hero", hero, "StopSound")

      combo_hero.teardown(player)

      mocks:assert("hero", "StopSound").self.called_with(SOUND_EVENTS.SNDEVT_INVOKER_METEOR_LOOP)
    end)

    it("resets hero abilities cooldowns", function()
      local unit = F.hero_invoker()
      local player = F.dota_player({ hero = unit.entity })
      --- @type luassert.spy[]
      local spies = {}

      unit:for_each_ability(function(ability)
        spies[#spies + 1] = spy.on(ability, "EndCooldown")
      end)

      assert.is_false(m.isEmpty(spies))

      combo_hero.teardown(player)

      for _, s in ipairs(spies) do
        assert.spy(s).self.called()
      end
    end)

    it("resets hero items cooldowns", function()
      local unit = F.hero_invoker(nil, { items = { "item_shivas_guard", "item_refresher" } })
      local hero = unit.entity

      assert.is_false(m.isEmpty(hero.inventory))

      local player = F.dota_player({ hero = hero })
      --- @type luassert.spy[]
      local spies = {}

      unit:for_each_item(function(item)
        spies[#spies + 1] = spy.on(item, "EndCooldown")
      end)

      assert.is_false(m.isEmpty(spies))

      combo_hero.teardown(player)

      for _, s in ipairs(spies) do
        assert.spy(s).self.called()
      end
    end)

    describe("with dropped items", function()
      local hero = F.dota_hero_invoker()
      local player = F.dota_player({ hero = hero })

      dropped_items = {
        F.dota_item({ name = "item_blink", purchaser = hero }),
        F.dota_item({ name = "item_refresher", purchaser = hero }),
        F.dota_item({ name = "item_travel_boots", purchaser = hero }),
      }

      it("removes dropped items owned by the hero", function()
        --- @type { [CDOTA_Item]: luassert.spy }
        local item_spies = m.map(dropped_items, function(item)
          return item, spy.on(item, "RemoveSelf")
        end)

        combo_hero.teardown(player)

        for item, spy in pairs(item_spies) do
          assert.spy(spy).self.called()
          assert.is_true(item:IsNull())
        end
      end)
    end)

    describe("with spawned units by the hero", function()
      local hero = F.dota_hero_invoker()
      local player = F.dota_player({ hero = hero })
      local units = {}
      local unit_spies = {}

      for _, name in pairs(INVOKER.SPAWNED_UNITS) do
        for _ = 0, 1 do
          local unit = F.dota_unit({ name = name, player_owner = player })

          units[name] = units[name] or {}
          units[name][#units[name] + 1] = unit

          unit_spies[name] = unit_spies[name] or {}
          unit_spies[name][unit] = { RemoveSelf = spy.on(unit, "RemoveSelf") }
        end
      end

      --- @type support.Mock
      local units_mocks = Mock()

      before_each(function()
        units_mocks:stub("Entities", Entities, "FindByName", function(_, start_ent, name)
          local ent_idx = start_ent and start_ent:GetEntityIndex() or 0

          local unit_idx = m.findIndex(units[name], function(unit)
            return unit:GetEntityIndex() > ent_idx
          end)

          return units[name][unit_idx]
        end)
      end)

      after_each(function()
        units_mocks:reset()
      end)

      it("removes spawned units by the hero", function()
        combo_hero.teardown(player)

        for _, group in pairs(unit_spies) do
          for unit, spies in pairs(group) do
            assert.spy(spies.RemoveSelf).self.called_with()
            assert.is_true(unit:IsNull())
          end
        end
      end)
    end)

    describe("with soft reset", function()
      it("purges the hero", function()
        local hero = F.dota_hero_invoker()
        local player = F.dota_player({ hero = hero })

        mocks:spy("hero", hero, "Purge")

        combo_hero.teardown(player)

        mocks:assert("hero", "Purge").self.called_with(true, true, false, true, true)
      end)

      it("heals the hero to max health", function()
        local hero = F.dota_hero_invoker({ max_health = 1000.0, health = 301.25 })
        local player = F.dota_player({ hero = hero })

        assert.equal(301.25, hero:GetHealth())

        combo_hero.teardown(player)

        assert.equal(1000.0, hero:GetHealth())
      end)

      it("gives the hero max mana", function()
        local hero = F.dota_hero_invoker({ max_mana = 1000.0, mana = 301.25 })
        local player = F.dota_player({ hero = hero })

        assert.equal(301.25, hero:GetMana())

        combo_hero.teardown(player)

        assert.equal(1000.0, hero:GetMana())
      end)
    end)

    describe("with hard reset", function()
      before_each(function()
        mocks:stub("PlayerResource", PlayerResource, "ReplaceHeroWithNoTransfer")
      end)

      after_each(function()
        mocks:reset("PlayerResource", "ReplaceHeroWithNoTransfer")
      end)

      it("removes all hero's items", function()
        local hero = F.dota_hero_invoker(nil, { items = { "item_shivas_guard", "item_refresher" } })
        local player = F.dota_player({ hero = hero })

        combo_hero.teardown(player, { hard_reset = true })

        assert.same({}, hero.inventory)
      end)

      it("resets hero abilities", function()
        local abilities = {
          [AbilityName.QUAS] = 7,
          [AbilityName.WEX] = 4,
          [AbilityName.EXORT] = 6,
          [AbilityName.COLD_SNAP] = 1,
          [AbilityName.SUN_STRIKE] = 1,
          [AbilityName.TALENT_L10_RIGHT] = 1,
          [AbilityName.TALENT_L10_LEFT] = 0,
          [AbilityName.TALENT_L15_RIGHT] = 1,
          [AbilityName.TALENT_L15_LEFT] = 0,
          [AbilityName.TALENT_L20_RIGHT] = 1,
          [AbilityName.TALENT_L20_LEFT] = 0,
          [AbilityName.TALENT_L25_RIGHT] = 1,
          [AbilityName.TALENT_L25_LEFT] = 0,
        }

        local hero = F.dota_hero_invoker(nil, { abilities = abilities })
        local player = F.dota_player({ hero = hero })

        combo_hero.teardown(player, { hard_reset = true })

        for _, name in ipairs(INVOKER.ORB_ABILITIES) do
          assert.equal(0, dota2_h.require_ability(hero, name):GetLevel())
        end

        for _, name in ipairs(INVOKER.TALENT_ABILITIES) do
          assert.equal(0, dota2_h.require_ability(hero, name):GetLevel())
        end

        assert.equal(1, dota2_h.require_ability(hero, AbilityName.COLD_SNAP):GetLevel())
        assert.equal(1, dota2_h.require_ability(hero, AbilityName.SUN_STRIKE):GetLevel())
        assert.equal(1, hero:GetAbilityPoints())
      end)

      it("replaces hero with a new one", function()
        local hero = F.dota_hero_invoker()
        local player = F.dota_player({ player_id = 31, hero = hero })

        mocks:spy("hero", hero, "RemoveSelf")

        combo_hero.teardown(player, { hard_reset = true })

        mocks
          :assert("PlayerResource", "ReplaceHeroWithNoTransfer").self
          .called_with(31, INVOKER.UNIT_NAME, -1, 0)
        mocks:assert("hero", "RemoveSelf").self.called()
        assert.is_true(hero:IsNull())
      end)
    end)
  end)

  describe(".refund_purchase", function()
    it("refunds a purchase", function()
      local hero = F.dota_hero_invoker()
      local player = F.dota_player({ hero = hero })
      local purchase = { item = "item_blink", cost = 12345 }

      hero:SetGold(0, true)
      hero:SetGold(0, false)

      assert.equal(0, hero:GetGold())

      combo_hero.refund_purchase(player, purchase)

      assert.equal(12345, hero:GetGold())
    end)
  end)

  describe(".level_up", function()
    local abilities = {
      [AbilityName.QUAS] = 1,
      [AbilityName.WEX] = 1,
      [AbilityName.EXORT] = 1,
      [AbilityName.COLD_SNAP] = 1,
      [AbilityName.SUN_STRIKE] = 1,
    }

    --- @type CDOTA_BaseNPC_Hero
    local hero
    --- @type CDOTAPlayerController
    local player

    before_each(function()
      hero = F.dota_hero_invoker({ level = 3, ability_points = 0 }, { abilities = abilities })
      player = F.dota_player({ hero = hero })
    end)

    describe("with specific level option", function()
      it("levels up the player hero to the specified level", function()
        assert.equal(3, hero:GetLevel())
        assert.equal(0, hero:GetAbilityPoints())

        combo_hero.level_up(player, { level = 6 })

        assert.equal(6, hero:GetLevel())
        assert.equal(3, hero:GetAbilityPoints())
      end)
    end)

    describe("with empty level option", function()
      it("levels up the player hero by one level", function()
        assert.equal(3, hero:GetLevel())
        assert.equal(0, hero:GetAbilityPoints())

        combo_hero.level_up(player)

        assert.equal(4, hero:GetLevel())
        assert.equal(1, hero:GetAbilityPoints())
      end)
    end)

    describe("with max_level option", function()
      it("levels up the player hero, abilities and talents to max level", function()
        assert.equal(3, hero:GetLevel())
        assert.equal(0, hero:GetAbilityPoints())

        -- selene: allow(global_usage)
        local spy_hero_max_level = spy.on(_G, "HeroMaxLevel")

        combo_hero.level_up(player, { max_level = true })

        assert.spy(spy_hero_max_level).called(1)

        assert.equal(LIMITS.MAX_HERO_LEVEL, hero:GetLevel())
        assert.equal(0, hero:GetAbilityPoints())

        for _, name in ipairs(INVOKER.ORB_ABILITIES) do
          local ability = dota2_h.require_ability(hero, name)

          assert.equal(ability:GetMaxLevel(), ability:GetLevel())
        end

        for _, name in ipairs(INVOKER.TALENT_ABILITIES) do
          local ability = dota2_h.require_ability(hero, name)

          assert.equal(ability:GetMaxLevel(), ability:GetLevel())
        end

        assert.equal(1, dota2_h.require_ability(hero, AbilityName.COLD_SNAP):GetLevel())
        assert.equal(1, dota2_h.require_ability(hero, AbilityName.SUN_STRIKE):GetLevel())
      end)
    end)
  end)
end)

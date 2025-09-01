local assert = require("luassert")

local F = require("support.factory")

local Ability = require("invk.dota2.ability")
local DamageInstance = require("invk.dota2.damage_instance")
local INVOKER = require("invk.const.invoker")
local Unit = require("invk.dota2.unit")

describe("invk.dota2.DamageInstance", function()
  describe("constructor", function()
    it("initializes attributes", function()
      local victim_hero = F.dota_hero_invoker()
      local victim = Unit:new(victim_hero)
      local attacker_hero = F.dota_hero({ name = "npc_dota_hero_axe" })
      local attacker = Unit:new(attacker_hero)
      local inflictor_ability = F.dota_ability({ name = "axe_culling_blade" })
      local inflictor = Ability:new(inflictor_ability)
      local dmg = DamageInstance:new(victim, 666, attacker, inflictor)

      assert.equal(victim, dmg.victim)
      assert.equal(666, dmg.amount)
      assert.equal(attacker, dmg.attacker)
      assert.equal(inflictor, dmg.inflictor)
      assert.equal(DOTA_DAMAGE_CATEGORY_SPELL, dmg.category)
    end)
  end)

  describe(":victim_name", function()
    it("returns the victim's entity name", function()
      local victim_hero = F.dota_hero_invoker()
      local victim = Unit:new(victim_hero)
      local attacker_hero = F.dota_hero({ name = "npc_dota_hero_axe" })
      local attacker = Unit:new(attacker_hero)
      local inflictor_ability = F.dota_ability({ name = "axe_culling_blade" })
      local inflictor = Ability:new(inflictor_ability)
      local dmg = DamageInstance:new(victim, 666, attacker, inflictor)

      assert.equal(INVOKER.UNIT_NAME, dmg:victim_name())
    end)
  end)

  describe(":attacker_name", function()
    it("returns the attacker's entity name", function()
      local victim_hero = F.dota_hero_invoker()
      local victim = Unit:new(victim_hero)
      local dmg = DamageInstance:new(victim, 666, nil, nil)

      assert.is_nil(dmg:attacker_name())

      local attacker_hero = F.dota_hero({ name = "npc_dota_hero_axe" })
      local attacker = Unit:new(attacker_hero)
      local inflictor_ability = F.dota_ability({ name = "axe_culling_blade" })
      local inflictor = Ability:new(inflictor_ability)

      dmg = DamageInstance:new(victim, 666, attacker, inflictor)

      assert.equal("npc_dota_hero_axe", dmg:attacker_name())
    end)
  end)

  describe(":attacker_player_owner", function()
    it("returns the attacker's player entity", function()
      local victim_hero = F.dota_hero_invoker()
      local victim = Unit:new(victim_hero)
      local dmg = DamageInstance:new(victim, 666, nil, nil)

      assert.is_nil(dmg:attacker_player_owner())

      local player = F.dota_player()
      local attacker_hero = F.dota_hero({ name = "npc_dota_hero_axe", player_owner = player })
      local attacker = Unit:new(attacker_hero)
      local inflictor_ability = F.dota_ability({ name = "axe_culling_blade" })
      local inflictor = Ability:new(inflictor_ability)

      dmg = DamageInstance:new(victim, 666, attacker, inflictor)

      assert.equal(player, dmg:attacker_player_owner())
    end)
  end)

  describe(":inflictor_name", function()
    it("returns the inflictor's ability name", function()
      local victim_hero = F.dota_hero_invoker()
      local victim = Unit:new(victim_hero)
      local dmg = DamageInstance:new(victim, 666, nil, nil)

      assert.is_nil(dmg:inflictor_name())

      local attacker_hero = F.dota_hero({ name = "npc_dota_hero_axe" })
      local attacker = Unit:new(attacker_hero)
      local inflictor_ability = F.dota_ability({ name = "axe_culling_blade" })
      local inflictor = Ability:new(inflictor_ability)

      dmg = DamageInstance:new(victim, 666, attacker, inflictor)

      assert.equal("axe_culling_blade", dmg:inflictor_name())
    end)
  end)
end)

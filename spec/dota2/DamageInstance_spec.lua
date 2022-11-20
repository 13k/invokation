local create = require("support.factory").create

local Unit = require("invokation.dota2.Unit")
local Ability = require("invokation.dota2.Ability")
local DamageInstance = require("invokation.dota2.DamageInstance")

local INVOKER = require("invokation.const.invoker")

describe("dota2.DamageInstance", function()
  describe("constructor", function()
    it("initializes attributes", function()
      local victimHero = create("dota_hero_invoker")
      local victim = Unit(victimHero)
      local attackerHero = create("dota_hero", { name = "npc_dota_hero_axe" })
      local attacker = Unit(attackerHero)
      local inflictorAbility = create("dota_ability", { name = "axe_culling_blade" })
      local inflictor = Ability(inflictorAbility)
      local dmg = DamageInstance(victim, 666, attacker, inflictor)

      assert.equal(victim, dmg.victim)
      assert.equal(666, dmg.amount)
      assert.equal(attacker, dmg.attacker)
      assert.equal(inflictor, dmg.inflictor)
      assert.equal(DOTA_DAMAGE_CATEGORY_SPELL, dmg.category)
    end)
  end)

  describe("#VictimName", function()
    it("returns the victim's entity name", function()
      local victimHero = create("dota_hero_invoker")
      local victim = Unit(victimHero)
      local attackerHero = create("dota_hero", { name = "npc_dota_hero_axe" })
      local attacker = Unit(attackerHero)
      local inflictorAbility = create("dota_ability", { name = "axe_culling_blade" })
      local inflictor = Ability(inflictorAbility)
      local dmg = DamageInstance(victim, 666, attacker, inflictor)

      assert.equal(INVOKER.UNIT_NAME, dmg:VictimName())
    end)
  end)

  describe("#AttackerName", function()
    it("returns the attacker's entity name", function()
      local victimHero = create("dota_hero_invoker")
      local victim = Unit(victimHero)
      local dmg = DamageInstance(victim, 666, nil, nil)

      assert.is_nil(dmg:AttackerName())

      local attackerHero = create("dota_hero", { name = "npc_dota_hero_axe" })
      local attacker = Unit(attackerHero)
      local inflictorAbility = create("dota_ability", { name = "axe_culling_blade" })
      local inflictor = Ability(inflictorAbility)

      dmg = DamageInstance(victim, 666, attacker, inflictor)

      assert.equal("npc_dota_hero_axe", dmg:AttackerName())
    end)
  end)

  describe("#AttackerPlayerOwner", function()
    it("returns the attacker's player entity", function()
      local victimHero = create("dota_hero_invoker")
      local victim = Unit(victimHero)
      local dmg = DamageInstance(victim, 666, nil, nil)

      assert.is_nil(dmg:AttackerPlayerOwner())

      local player = create("dota_player")
      local attackerHero = create("dota_hero", { name = "npc_dota_hero_axe", playerOwner = player })
      local attacker = Unit(attackerHero)
      local inflictorAbility = create("dota_ability", { name = "axe_culling_blade" })
      local inflictor = Ability(inflictorAbility)

      dmg = DamageInstance(victim, 666, attacker, inflictor)

      assert.equal(player, dmg:AttackerPlayerOwner())
    end)
  end)

  describe("#InflictorName", function()
    it("returns the inflictor's ability name", function()
      local victimHero = create("dota_hero_invoker")
      local victim = Unit(victimHero)
      local dmg = DamageInstance(victim, 666, nil, nil)

      assert.is_nil(dmg:InflictorName())

      local attackerHero = create("dota_hero", { name = "npc_dota_hero_axe" })
      local attacker = Unit(attackerHero)
      local inflictorAbility = create("dota_ability", { name = "axe_culling_blade" })
      local inflictor = Ability(inflictorAbility)

      dmg = DamageInstance(victim, 666, attacker, inflictor)

      assert.equal("axe_culling_blade", dmg:InflictorName())
    end)
  end)
end)

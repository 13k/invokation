local m = require("moses")
local match = require("luassert.match")
local create = require("support.factory").create

local Combo = require("invokation.combos.Combo")
local Combos = require("invokation.combos.Combos")
local Talents = require("invokation.dota2.talents")
local CombosHero = require("invokation.combos.hero")
local CombosComm = require("invokation.combos.communication")
local CombosSound = require("invokation.combos.sound")
local FreestyleCombo = require("invokation.combos.FreestyleCombo")
local DamageInstance = require("invokation.dota2.DamageInstance")

local UNITS = require("invokation.const.units")
local COMBOS = require("invokation.const.combos")
local INVOKER = require("invokation.const.invoker")
local NET_TABLE = require("invokation.const.net_table")

describe("Combos", function()
  local combos
  local netTable = {}
  local dummySpawn = create("entity")
  local hero = create("dota_hero_invoker")
  local player = create("dota_player", { id = 13, hero = hero })

  setup(function()
    stub.new(Entities, "FindByName", function(_, _, name)
      return name == UNITS.DUMMY_TARGET_SPAWN and dummySpawn or nil
    end)
  end)

  teardown(function()
    -- selene: allow(incorrect_standard_library_use)
    Entities.FindByName:revert()
  end)

  before_each(function()
    stub.new(netTable, "Set")

    combos = Combos(netTable)
  end)

  after_each(function()
    netTable.Set:clear()
  end)

  describe("constructor", function()
    it("loads and transforms specs", function()
      assert.equal(m.count(COMBOS), m.count(combos.specs))

      for _, spec in pairs(combos.specs) do
        assert.is_table(spec)
        assert.not_nil(spec.id)

        for _, step in pairs(spec.sequence) do
          assert.is_table(step)
          assert.not_nil(step.id)
        end
      end
    end)

    it("sets NetTable key with loaded specs", function()
      assert.stub(netTable.Set).was.self.called_with(NET_TABLE.MAIN.KEYS.COMBOS, combos.specs)
    end)
  end)

  describe("#OnAbilityUsed", function()
    before_each(function()
      stub.new(combos, "CaptureAbility")
      stub.new(combos, "Progress")
    end)

    after_each(function()
      combos.CaptureAbility:revert()
      combos.Progress:revert()
    end)

    local unit = create("hero_invoker")

    describe("with relevant ability", function()
      local ability = create("ability", { name = INVOKER.ABILITY_SUN_STRIKE })

      it("handles ability capture and combo progress", function()
        combos:OnAbilityUsed(player, unit, ability)

        assert.stub(combos.CaptureAbility).was.self.called_with(player, ability)
        assert.stub(combos.Progress).was.self.called_with(player, ability)
      end)
    end)

    describe("with ignored ability", function()
      local ability = create("ability", { name = "item_phase_boots" })

      it("is a noop", function()
        combos:OnAbilityUsed(player, unit, ability)

        assert.stub(combos.CaptureAbility).was_not.called()
        assert.stub(combos.Progress).was_not.called()
      end)
    end)
  end)

  describe("#OnEntityHurt", function()
    before_each(function()
      stub.new(combos, "ProgressDamage")
    end)

    after_each(function()
      combos.ProgressDamage:revert()
    end)

    local victim = create("unit", { name = UNITS.DUMMY_TARGET })

    describe("with player-owned attacker", function()
      local attacker = create("hero_invoker", { playerOwner = player })
      local inflictor = create("ability", { name = INVOKER.ABILITY_SUN_STRIKE })

      it("handles combo damage progress", function()
        local damage = DamageInstance(victim, 123.4, attacker, inflictor)
        local owner = damage:AttackerPlayerOwner()

        combos:OnEntityHurt(damage)

        assert.stub(combos.ProgressDamage).was.self.called_with(owner, damage)
      end)
    end)

    describe("with non-player attacker", function()
      local attacker = create("unit", { name = "npc_dota_hero_axe" })
      local inflictor = create("ability", { name = "item_dagon_5" })

      it("is a noop", function()
        local damage = DamageInstance(victim, 123.4, attacker, inflictor)

        combos:OnEntityHurt(damage)

        assert.stub(combos.ProgressDamage).was_not.called()
      end)
    end)
  end)

  describe("#OnItemPurchased", function()
    local purchase = { item = "item_blink", cost = 1234.5 }

    describe("when no combo is active", function()
      it("is a noop", function()
        hero:SetGold(0, true)
        hero:SetGold(0, false)

        assert.equal(0, hero:GetGold())

        combos:OnItemPurchased(player, purchase)

        assert.equal(0, hero:GetGold())
      end)
    end)

    describe("when a regular combo is active", function()
      it("is a noop", function()
        combos:Start(player, combos:Create(1))
        hero:SetGold(0, true)
        hero:SetGold(0, false)

        assert.equal(0, hero:GetGold())

        combos:OnItemPurchased(player, purchase)

        assert.equal(0, hero:GetGold())
      end)
    end)

    describe("when freestyle combo is active", function()
      it("refunds the purchase", function()
        combos:Start(player, combos:Create(FreestyleCombo.COMBO_ID))
        hero:SetGold(0, true)
        hero:SetGold(0, false)

        assert.equal(0, hero:GetGold())

        combos:OnItemPurchased(player, purchase)

        assert.equal(1234.5, hero:GetGold())
      end)
    end)
  end)

  describe("#Create", function()
    describe("with an invalid id", function()
      it("throws an error", function()
        local createFn = m.bindn(combos.Create, combos, -1)
        assert.error(createFn, 'Combo "-1" not found')
      end)
    end)

    describe("with freestyle id", function()
      it("creates a freestyle combo", function()
        local combo = combos:Create(FreestyleCombo.COMBO_ID)

        assert.not_nil(combo)
        assert.is_true(FreestyleCombo:class_of(combo))
      end)
    end)

    describe("with a valid id", function()
      it("creates a combo", function()
        local combo = combos:Create(13)

        assert.not_nil(combo)
        assert.is_true(Combo:class_of(combo))
      end)
    end)
  end)

  describe("#Start", function()
    before_each(function()
      spy.on(CombosHero, "setup")
      spy.on(CombosHero, "teardown")
      spy.on(CombosSound, "onDummyCreate")
      spy.on(CombosSound, "onComboStart")
      spy.on(CombosSound, "onComboStop")
      spy.on(CombosComm, "sendStarted")
      spy.on(CombosComm, "sendStopped")
    end)

    after_each(function()
      CombosHero.setup:revert()
      CombosHero.teardown:revert()
      CombosSound.onDummyCreate:revert()
      CombosSound.onComboStart:revert()
      CombosSound.onComboStop:revert()
      CombosComm.sendStarted:revert()
      CombosComm.sendStopped:revert()
    end)

    describe("when no combo is active", function()
      it("starts the combo", function()
        assert.is_nil(combos.state[player].combo)

        combos:Start(player, combos:Create(13))

        local combo = combos.state[player].combo
        local dummy = combos.state[player].dummy

        assert.not_nil(combo)
        assert.not_nil(dummy)

        assert.equal(13, combo.id)
        assert.is_true(dummy:IsAlive())

        assert.spy(CombosHero.teardown).was.called_with(match.is_ref(player), { hardReset = true })
        assert.spy(CombosHero.setup).was.called_with(match.is_ref(player), match.is_ref(combo))
        assert.spy(CombosSound.onDummyCreate).was.called_with(match.is_ref(dummy))
        assert.spy(CombosSound.onComboStop).was_not.called()
        assert.spy(CombosSound.onComboStart).was.called_with(match.is_ref(player))
        assert.spy(CombosComm.sendStarted).was.called_with(match.is_ref(player), match.is_ref(combo))
        assert.spy(CombosComm.sendStopped).was_not.called()
      end)
    end)

    describe("when the same combo is already active", function()
      it("restarts the combo", function()
        combos:Start(player, combos:Create(13))

        local comboBefore = combos.state[player].combo

        assert.not_nil(comboBefore)
        assert.equal(13, comboBefore.id)

        CombosHero.setup:clear()
        CombosHero.teardown:clear()
        CombosSound.onDummyCreate:clear()
        CombosSound.onComboStart:clear()
        CombosSound.onComboStop:clear()
        CombosComm.sendStarted:clear()
        CombosComm.sendStopped:clear()

        combos:Start(player, combos:Create(13))

        local comboAfter = combos.state[player].combo
        local dummy = combos.state[player].dummy

        assert.not_nil(comboAfter)
        assert.not_nil(dummy)

        assert.not_equal(comboAfter, comboBefore)
        assert.equal(13, comboAfter.id)
        assert.is_true(dummy:IsAlive())

        assert.spy(CombosHero.teardown).was.called_with(match.is_ref(player), { hardReset = false })

        assert.spy(CombosHero.setup).was.called_with(match.is_ref(player), match.is_ref(comboAfter))

        assert.spy(CombosSound.onDummyCreate).was_not.called_with(match.is_ref(dummy))
        assert.spy(CombosSound.onComboStop).was_not.called()
        assert.spy(CombosSound.onComboStart).was.called_with(match.is_ref(player))

        assert.spy(CombosComm.sendStarted).was.called_with(match.is_ref(player), match.is_ref(comboAfter))

        assert.spy(CombosComm.sendStopped).was_not.called()
      end)
    end)

    describe("when a different combo is already active", function()
      it("stops the previous combo and starts the new combo", function()
        combos:Start(player, combos:Create(13))

        local comboBefore = combos.state[player].combo

        assert.not_nil(comboBefore)
        assert.equal(13, comboBefore.id)

        CombosHero.setup:clear()
        CombosHero.teardown:clear()
        CombosSound.onDummyCreate:clear()
        CombosSound.onComboStart:clear()
        CombosSound.onComboStop:clear()
        CombosComm.sendStarted:clear()
        CombosComm.sendStopped:clear()

        combos:Start(player, combos:Create(3))

        local comboAfter = combos.state[player].combo
        local dummy = combos.state[player].dummy

        assert.not_nil(comboAfter)
        assert.not_nil(dummy)

        assert.not_equal(comboAfter, comboBefore)
        assert.equal(3, comboAfter.id)
        assert.is_true(dummy:IsAlive())

        assert.spy(CombosHero.teardown).was.called_with(match.is_ref(player), { hardReset = true })

        assert.spy(CombosHero.setup).was.called_with(match.is_ref(player), match.is_ref(comboAfter))

        assert.spy(CombosSound.onDummyCreate).was_not.called_with(match.is_ref(dummy))
        assert.spy(CombosSound.onComboStop).was.called_with(match.is_ref(player))
        assert.spy(CombosSound.onComboStart).was.called_with(match.is_ref(player))

        assert.spy(CombosComm.sendStarted).was.called_with(match.is_ref(player), match.is_ref(comboAfter))

        assert.spy(CombosComm.sendStopped).was.called_with(match.is_ref(player), match.is_ref(comboBefore))
      end)
    end)
  end)

  describe("#Stop", function()
    before_each(function()
      spy.on(CombosHero, "teardown")
      spy.on(CombosSound, "onComboStop")
      spy.on(CombosComm, "sendStopped")
    end)

    after_each(function()
      CombosHero.teardown:revert()
      CombosSound.onComboStop:revert()
      CombosComm.sendStopped:revert()
    end)

    describe("when no combo is active", function()
      it("throws an error", function()
        local stopFn = m.bindn(combos.Stop, combos, player)

        assert.error(stopFn, "Player 13 has no active combo")
        assert.spy(CombosHero.teardown).was_not.called()
        assert.spy(CombosSound.onComboStop).was_not.called()
        assert.spy(CombosComm.sendStopped).was_not.called()
      end)
    end)

    describe("when a combo is active", function()
      it("stops the active combo", function()
        combos:Start(player, combos:Create(13))

        local comboBefore = combos.state[player].combo
        local dummyBefore = combos.state[player].dummy

        assert.not_nil(comboBefore)
        assert.not_nil(dummyBefore)
        assert.equal(13, comboBefore.id)
        assert.is_true(dummyBefore:IsAlive())

        CombosHero.teardown:clear()
        CombosSound.onComboStop:clear()
        CombosComm.sendStopped:clear()

        combos:Stop(player)

        local comboAfter = combos.state[player].combo
        local dummyAfter = combos.state[player].dummy

        assert.is_nil(comboAfter)
        assert.not_nil(dummyAfter)
        assert.equal(dummyBefore, dummyAfter)
        assert.is_false(dummyAfter:IsAlive())

        assert.spy(CombosHero.teardown).was.called_with(match.is_ref(player), { hardReset = true })
        assert.spy(CombosSound.onComboStop).was.called_with(match.is_ref(player))
        assert.spy(CombosComm.sendStopped).was.called_with(match.is_ref(player), match.is_ref(comboBefore))
      end)
    end)
  end)

  describe("#Restart", function()
    before_each(function()
      spy.on(CombosHero, "setup")
      spy.on(CombosHero, "teardown")
      spy.on(CombosSound, "onDummyCreate")
      spy.on(CombosSound, "onComboStart")
      spy.on(CombosSound, "onComboStop")
      spy.on(CombosComm, "sendStarted")
      spy.on(CombosComm, "sendStopped")
    end)

    after_each(function()
      CombosHero.setup:revert()
      CombosHero.teardown:revert()
      CombosSound.onDummyCreate:revert()
      CombosSound.onComboStart:revert()
      CombosSound.onComboStop:revert()
      CombosComm.sendStarted:revert()
      CombosComm.sendStopped:revert()
    end)

    describe("when no combo is active", function()
      it("throws an error", function()
        local restartFn = m.bindn(combos.Restart, combos, player)

        assert.error(restartFn, "Player 13 has no active combo")

        assert.spy(CombosHero.teardown).was_not.called()
        assert.spy(CombosHero.setup).was_not.called()
        assert.spy(CombosSound.onDummyCreate).was_not.called()
        assert.spy(CombosSound.onComboStart).was_not.called()
        assert.spy(CombosSound.onComboStop).was_not.called()
        assert.spy(CombosComm.sendStarted).was_not.called()
        assert.spy(CombosComm.sendStopped).was_not.called()
      end)
    end)

    describe("when a combo is active", function()
      describe("without hard reset option", function()
        it("restarts the combo", function()
          combos:Start(player, combos:Create(13))

          local comboBefore = combos.state[player].combo

          assert.not_nil(comboBefore)
          assert.equal(13, comboBefore.id)

          CombosHero.setup:clear()
          CombosHero.teardown:clear()
          CombosSound.onDummyCreate:clear()
          CombosSound.onComboStart:clear()
          CombosSound.onComboStop:clear()
          CombosComm.sendStarted:clear()
          CombosComm.sendStopped:clear()

          combos:Restart(player, { hardReset = false })

          local comboAfter = combos.state[player].combo
          local dummy = combos.state[player].dummy

          assert.not_nil(comboAfter)
          assert.not_nil(dummy)

          assert.not_equal(comboAfter, comboBefore)
          assert.equal(13, comboAfter.id)
          assert.is_true(dummy:IsAlive())

          assert.spy(CombosHero.teardown).was.called_with(match.is_ref(player), { hardReset = false })

          assert.spy(CombosHero.setup).was.called_with(match.is_ref(player), match.is_ref(comboAfter))

          assert.spy(CombosSound.onDummyCreate).was_not.called_with(match.is_ref(dummy))
          assert.spy(CombosSound.onComboStop).was_not.called()
          assert.spy(CombosSound.onComboStart).was.called_with(match.is_ref(player))

          assert.spy(CombosComm.sendStarted).was.called_with(match.is_ref(player), match.is_ref(comboAfter))

          assert.spy(CombosComm.sendStopped).was_not.called()
        end)
      end)

      describe("with hard reset option", function()
        it("restarts the combo", function()
          combos:Start(player, combos:Create(13))

          local comboBefore = combos.state[player].combo

          assert.not_nil(comboBefore)
          assert.equal(13, comboBefore.id)

          CombosHero.setup:clear()
          CombosHero.teardown:clear()
          CombosSound.onDummyCreate:clear()
          CombosSound.onComboStart:clear()
          CombosSound.onComboStop:clear()
          CombosComm.sendStarted:clear()
          CombosComm.sendStopped:clear()

          combos:Restart(player, { hardReset = true })

          local comboAfter = combos.state[player].combo
          local dummy = combos.state[player].dummy

          assert.not_nil(comboAfter)
          assert.not_nil(dummy)

          assert.not_equal(comboAfter, comboBefore)
          assert.equal(13, comboAfter.id)
          assert.is_true(dummy:IsAlive())

          assert.spy(CombosHero.teardown).was.called_with(match.is_ref(player), { hardReset = true })

          assert.spy(CombosHero.setup).was.called_with(match.is_ref(player), match.is_ref(comboAfter))

          assert.spy(CombosSound.onDummyCreate).was_not.called_with(match.is_ref(dummy))
          assert.spy(CombosSound.onComboStop).was_not.called()
          assert.spy(CombosSound.onComboStart).was.called_with(match.is_ref(player))

          assert.spy(CombosComm.sendStarted).was.called_with(match.is_ref(player), match.is_ref(comboAfter))

          assert.spy(CombosComm.sendStopped).was_not.called()
        end)
      end)
    end)
  end)

  describe("#Progress", function()
    local combo

    before_each(function()
      combo = Combo({
        id = m.uniqueId("Combos_spec-Progress-%d"),
        specialty = "qw",
        stance = "defensive",
        heroLevel = 25,
        damageRating = 5,
        difficultyRating = 5,
        gold = 1234,
        tags = { "late-game" },
        items = { "item_blink" },
        orbs = { 7, 7, 7 },
        talents = Talents.Select(Talents.L10_LEFT, Talents.L15_RIGHT, Talents.L20_RIGHT, Talents.L25_RIGHT),
        sequence = {
          { id = 1, name = INVOKER.ABILITY_COLD_SNAP, required = true, next = { 2, 3 } },
          { id = 2, name = INVOKER.ABILITY_GHOST_WALK, next = { 3 } },
          { id = 3, name = INVOKER.ABILITY_EMP, required = true },
        },
      })

      spy.on(combos, "PreFinish")
      spy.on(combos, "Fail")
      spy.on(CombosComm, "sendInProgress")
      spy.on(CombosComm, "sendProgress")
    end)

    after_each(function()
      combos.PreFinish:revert()
      combos.Fail:revert()
      CombosComm.sendInProgress:revert()
      CombosComm.sendProgress:revert()
    end)

    describe("with no active combo", function()
      it("does nothing", function()
        combos:Progress(player, create("ability", { name = INVOKER.ABILITY_COLD_SNAP }))

        assert.spy(combos.PreFinish).was_not.called()
        assert.spy(combos.Fail).was_not.called()
        assert.spy(CombosComm.sendInProgress).was_not.called()
        assert.spy(CombosComm.sendProgress).was_not.called()
      end)
    end)

    describe("with failed combo", function()
      it("does nothing", function()
        combos:Start(player, combo)
        combo:Fail()
        combos:Progress(player, create("ability", { name = INVOKER.ABILITY_COLD_SNAP }))

        assert.spy(combos.PreFinish).was_not.called()
        assert.spy(combos.Fail).was_not.called()
        assert.spy(CombosComm.sendInProgress).was_not.called()
        assert.spy(CombosComm.sendProgress).was_not.called()
      end)
    end)

    describe("with pre-finished combo", function()
      it("does nothing", function()
        combos:Start(player, combo)

        assert.is_true(combo:Progress(create("ability", { name = INVOKER.ABILITY_COLD_SNAP })))
        assert.is_true(combo:Progress(create("ability", { name = INVOKER.ABILITY_GHOST_WALK })))
        assert.is_true(combo:Progress(create("ability", { name = INVOKER.ABILITY_EMP })))
        assert.is_true(combo:PreFinish())

        assert.is_true(combo.preFinished)

        combos:Progress(player, create("ability", { name = INVOKER.ABILITY_COLD_SNAP }))

        assert.spy(combos.PreFinish).was_not.called()
        assert.spy(combos.Fail).was_not.called()
        assert.spy(CombosComm.sendInProgress).was_not.called()
        assert.spy(CombosComm.sendProgress).was_not.called()
      end)
    end)

    describe("with finished combo", function()
      it("does nothing", function()
        combos:Start(player, combo)

        assert.is_true(combo:Progress(create("ability", { name = INVOKER.ABILITY_COLD_SNAP })))
        assert.is_true(combo:Progress(create("ability", { name = INVOKER.ABILITY_GHOST_WALK })))
        assert.is_true(combo:Progress(create("ability", { name = INVOKER.ABILITY_EMP })))
        assert.is_true(combo:PreFinish())
        assert.is_true(combo:Finish())

        assert.is_true(combo.finished)

        combos:Progress(player, create("ability", { name = INVOKER.ABILITY_COLD_SNAP }))

        assert.spy(combos.PreFinish).was_not.called()
        assert.spy(combos.Fail).was_not.called()
        assert.spy(CombosComm.sendInProgress).was_not.called()
        assert.spy(CombosComm.sendProgress).was_not.called()
      end)
    end)

    describe("with regular active combo", function()
      before_each(function()
        combos:Start(player, combo)
      end)

      describe("with invocation ability", function()
        it("does nothing", function()
          combos:Progress(player, create("ability", { name = INVOKER.ABILITY_EXORT }))

          assert.spy(combos.PreFinish).was_not.called()
          assert.spy(combos.Fail).was_not.called()
          assert.spy(CombosComm.sendInProgress).was_not.called()
          assert.spy(CombosComm.sendProgress).was_not.called()
        end)
      end)

      describe("with incorrect ability", function()
        local ability = create("ability", { name = INVOKER.ABILITY_SUN_STRIKE })

        it("fails the combo", function()
          combos:Progress(player, ability)

          assert.is_true(combo.failed)
          assert.spy(combos.Fail).was.self.called_with(match.is_ref(player), match.is_ref(ability))
          assert.spy(CombosComm.sendInProgress).was_not.called()
          assert.spy(CombosComm.sendProgress).was_not.called()
        end)
      end)

      describe("with correct ability", function()
        it("progresses the combo", function()
          combos:Progress(player, create("ability", { name = INVOKER.ABILITY_COLD_SNAP }))

          assert.spy(combos.PreFinish).was_not.called()
          assert.spy(combos.Fail).was_not.called()
          assert.spy(CombosComm.sendProgress).was.called_with(match.is_ref(player), match.is_ref(combo))
        end)

        describe("when it's the first combo step", function()
          it("communicates that combo is in progress", function()
            local ability = create("ability", { name = INVOKER.ABILITY_COLD_SNAP })

            combos:Progress(player, ability)

            assert.spy(CombosComm.sendInProgress).was.called_with(match.is_ref(player), match.is_ref(combo))
          end)
        end)

        describe("when it's the last combo step", function()
          it("pre-finishes the combo", function()
            assert.is_true(combo:Progress(create("ability", { name = INVOKER.ABILITY_COLD_SNAP })))
            assert.is_true(combo:Progress(create("ability", { name = INVOKER.ABILITY_GHOST_WALK })))

            combos:Progress(player, create("ability", { name = INVOKER.ABILITY_EMP }))

            assert.is_true(combo.preFinished)
            assert.spy(combos.PreFinish).was.self.called_with(match.is_ref(player))
            assert.spy(combos.Fail).was_not.called()
          end)
        end)
      end)
    end)
  end)
end)

local assert = require("luassert")
local m = require("moses")
local match = require("luassert.match")

local F = require("support.factory")
local Mock = require("support.mock")

local BaseCombo = require("invk.combo.base_combo")
local COMBOS = require("invk.const.combos")
local Combo = require("invk.combo.combo")
local Combos = require("invk.combo.combos")
local DamageInstance = require("invk.dota2.damage_instance")
local FreestyleCombo = require("invk.combo.freestyle_combo")
local INVOKER = require("invk.const.invoker")
local NET_TABLE = require("invk.const.net_table")
local S = require("invk.combo.spec")
local UNITS = require("invk.const.units")
local Unit = require("invk.dota2.unit")
local combo_comms = require("invk.combo.communication")
local combo_hero = require("invk.combo.hero")
local combo_sound = require("invk.combo.sound")
local talents = require("invk.dota2.talents")

local AbilityName = INVOKER.AbilityName
local Talents = talents.Talents
local State = BaseCombo.State

local NET_TABLE_CFG = NET_TABLE.Tables[NET_TABLE.Name.MAIN]

describe("invk.combo.Combos", function()
  local mocks = Mock()
  --- @type invk.combo.Combos
  local combos
  local net_table = { keys = NET_TABLE_CFG.keys }
  local dummy_spawn = F.dota_entity({ name = "dummy_spawn" })
  local hero_ent = F.dota_hero_invoker()
  local player_ent = F.dota_player({ hero = hero_ent })
  local player_id = player_ent:GetPlayerID()
  --- @type invk.combo.PlayerState
  local player_state

  setup(function()
    mocks:stub("Entities", Entities, "FindByName", function(_, _, name)
      return name == UNITS.DUMMY_TARGET_SPAWN and dummy_spawn or nil
    end)
  end)

  teardown(function()
    mocks:reset()
  end)

  before_each(function()
    mocks:stub("net_table", net_table, "set")

    combos = Combos:new(net_table)

    combos.state[player_id] = {}
    player_state = combos.state[player_id]
  end)

  after_each(function()
    mocks:reset("net_table", "set")
  end)

  describe("constructor", function()
    it("loads and transforms specs", function()
      assert.equal(m.count(COMBOS), m.count(combos.specs))

      for _, spec in pairs(combos.specs) do
        assert.is_table(spec)
        assert.is_not_nil(spec.id)

        for _, step in pairs(spec.sequence) do
          assert.is_table(step)
          assert.is_not_nil(step.id)
        end
      end
    end)

    it("sets NetTable key with loaded specs", function()
      mocks:assert("net_table", "set").self.called_with(NET_TABLE_CFG.keys.COMBOS, combos.specs)
    end)
  end)

  describe(":create", function()
    describe("with an invalid id", function()
      it("throws an error", function()
        assert.error(function()
          combos:create(-1)
        end, 'Combo "-1" not found')
      end)
    end)

    describe("with freestyle id", function()
      it("creates a freestyle combo", function()
        local combo = combos:create(BaseCombo.FREESTYLE_COMBO_ID)

        assert.is_not_nil(combo)
        assert.is_true(combo:isInstanceOf(FreestyleCombo))
      end)
    end)

    describe("with a valid id", function()
      it("creates a combo", function()
        local combo = combos:create(13)

        assert.is_not_nil(combo)
        assert.is_true(combo:isInstanceOf(Combo))
      end)
    end)
  end)

  describe(":on_ability_used", function()
    before_each(function()
      mocks:stub("combos", combos, "capture_ability")
      mocks:stub("combos", combos, "on_progress")
    end)

    after_each(function()
      mocks:reset("combos", "capture_ability", "on_progress")
    end)

    local unit = Unit:new(hero_ent)

    describe("with relevant ability", function()
      local ability = F.ability({ name = AbilityName.SUN_STRIKE })

      it("handles ability capture and combo progress", function()
        combos:on_ability_used(player_ent, unit, ability)

        mocks:assert("combos", "capture_ability").self.called_with(player_ent, ability)
        mocks:assert("combos", "on_progress").self.called_with(player_ent, ability)
      end)
    end)

    describe("with ignored ability", function()
      local ability = F.ability({ name = "item_phase_boots" })

      it("is a noop", function()
        combos:on_ability_used(player_ent, unit, ability)

        mocks:assert("combos", "capture_ability").called(0)
        mocks:assert("combos", "on_progress").called(0)
      end)
    end)
  end)

  describe(":on_entity_hurt", function()
    before_each(function()
      mocks:stub("combos", combos, "on_progress_damage")
    end)

    after_each(function()
      mocks:reset("combos", "on_progress_damage")
    end)

    local victim = F.unit({ name = UNITS.DUMMY_TARGET })

    describe("with player-owned attacker", function()
      local attacker = F.hero_invoker({ player_owner = player_ent })
      local inflictor = F.ability({ name = AbilityName.SUN_STRIKE })

      it("handles combo damage progress", function()
        local damage = DamageInstance:new(victim, 123.4, attacker, inflictor)
        local owner = damage:attacker_player_owner()

        combos:on_entity_hurt(damage)

        mocks:assert("combos", "on_progress_damage").self.called_with(owner, damage)
      end)
    end)

    describe("with non-player attacker", function()
      local attacker = F.unit({ name = "npc_dota_hero_axe" })
      local inflictor = F.ability({ name = "item_dagon_5" })

      it("is a noop", function()
        local damage = DamageInstance:new(victim, 123.4, attacker, inflictor)

        combos:on_entity_hurt(damage)

        mocks:assert("combos", "on_progress_damage").called(0)
      end)
    end)
  end)

  describe(":on_item_purchased", function()
    local purchase = { item = "item_blink", cost = 12345 }

    describe("when no combo is active", function()
      it("is a noop", function()
        hero_ent:SetGold(0, true)
        hero_ent:SetGold(0, false)

        assert.equal(0, hero_ent:GetGold())

        combos:on_item_purchased(player_ent, purchase)

        assert.equal(0, hero_ent:GetGold())
      end)
    end)

    describe("when a regular combo is active", function()
      it("is a noop", function()
        combos:on_start(player_ent, combos:create(1))
        hero_ent:SetGold(0, true)
        hero_ent:SetGold(0, false)

        assert.equal(0, hero_ent:GetGold())

        combos:on_item_purchased(player_ent, purchase)

        assert.equal(0, hero_ent:GetGold())
      end)
    end)

    describe("when freestyle combo is active", function()
      it("refunds the purchase", function()
        combos:on_start(player_ent, combos:create(BaseCombo.FREESTYLE_COMBO_ID))
        hero_ent:SetGold(0, true)
        hero_ent:SetGold(0, false)

        assert.equal(0, hero_ent:GetGold())

        combos:on_item_purchased(player_ent, purchase)

        assert.equal(12345, hero_ent:GetGold())
      end)
    end)
  end)

  describe(":on_start", function()
    before_each(function()
      mocks:spy("combo_comms", combo_comms, { "send_started", "send_stopped" })
      mocks:spy("combo_hero", combo_hero, { "setup", "teardown" })
      mocks:spy(
        "combo_sound",
        combo_sound,
        { "on_dummy_create", "on_combo_start", "on_combo_stop" }
      )
    end)

    after_each(function()
      mocks:reset("combo_comms", "send_started", "send_stopped")
      mocks:reset("combo_hero", "setup", "teardown")
      mocks:reset("combo_sound", "on_dummy_create", "on_combo_start", "on_combo_stop")
    end)

    describe("when no combo is active", function()
      it("starts the combo", function()
        assert.is_nil(player_state.combo)

        combos:on_start(player_ent, combos:create(13))

        local combo = player_state.combo
        local dummy = player_state.dummy

        assert.is_not_nil(combo) --- @cast combo invk.combo.Combo
        assert.is_not_nil(dummy) --- @cast dummy invk.dota2.DummyTarget

        assert.equal(13, combo.id)
        assert.is_true(dummy:is_alive())

        mocks
          :assert("combo_hero", "teardown")
          .called_with(match.is_ref(player_ent), { hard_reset = true })
        mocks
          :assert("combo_hero", "setup")
          .called_with(match.is_ref(player_ent), match.is_ref(combo))
        mocks:assert("combo_sound", "on_dummy_create").called_with(match.is_ref(dummy))
        mocks:assert("combo_sound", "on_combo_stop").called(0)
        mocks:assert("combo_sound", "on_combo_start").called_with(match.is_ref(player_ent))
        mocks
          :assert("combo_comms", "send_started")
          .called_with(match.is_ref(player_ent), match.is_ref(combo))
        mocks:assert("combo_comms", "send_stopped").called(0)
      end)
    end)

    describe("when the same combo is already active", function()
      it("restarts the combo", function()
        combos:on_start(player_ent, combos:create(13))

        local combo_before = player_state.combo

        assert.is_not_nil(combo_before) --- @cast combo_before invk.combo.Combo
        assert.equal(13, combo_before.id)

        mocks:clear("combo_comms", "send_started", "send_stopped")
        mocks:clear("combo_hero", "setup", "teardown")
        mocks:clear("combo_sound", "on_dummy_create", "on_combo_start", "on_combo_stop")

        combos:on_start(player_ent, combos:create(13))

        local combo_after = player_state.combo
        local dummy = player_state.dummy

        assert.is_not_nil(combo_after) --- @cast combo_after invk.combo.Combo
        assert.is_not_nil(dummy) --- @cast dummy invk.dota2.DummyTarget

        assert.are_not_equal(combo_after, combo_before)
        assert.equal(13, combo_after.id)
        assert.is_true(dummy:is_alive())

        mocks
          :assert("combo_hero", "teardown")
          .called_with(match.is_ref(player_ent), { hard_reset = false })
        mocks
          :assert("combo_hero", "setup")
          .called_with(match.is_ref(player_ent), match.is_ref(combo_after))
        mocks:assert("combo_sound", "on_dummy_create").not_called_with(match.is_ref(dummy))
        mocks:assert("combo_sound", "on_combo_stop").called(0)
        mocks:assert("combo_sound", "on_combo_start").called_with(match.is_ref(player_ent))
        mocks
          :assert("combo_comms", "send_started")
          .called_with(match.is_ref(player_ent), match.is_ref(combo_after))
        mocks:assert("combo_comms", "send_stopped").called(0)
      end)
    end)

    describe("when a different combo is already active", function()
      it("stops the previous combo and starts the new combo", function()
        combos:on_start(player_ent, combos:create(13))

        local combo_before = player_state.combo

        assert.is_not_nil(combo_before) --- @cast combo_before invk.combo.Combo
        assert.equal(13, combo_before.id)

        mocks:clear("combo_comms", "send_started", "send_stopped")
        mocks:clear("combo_hero", "setup", "teardown")
        mocks:clear("combo_sound", "on_dummy_create", "on_combo_start", "on_combo_stop")

        combos:on_start(player_ent, combos:create(3))

        local combo_after = player_state.combo
        local dummy = player_state.dummy

        assert.is_not_nil(combo_after) --- @cast combo_after invk.combo.Combo
        assert.is_not_nil(dummy) --- @cast dummy invk.dota2.DummyTarget

        assert.are_not_equal(combo_after, combo_before)
        assert.equal(3, combo_after.id)
        assert.is_true(dummy:is_alive())

        mocks
          :assert("combo_hero", "teardown")
          .called_with(match.is_ref(player_ent), { hard_reset = true })
        mocks
          :assert("combo_hero", "setup")
          .called_with(match.is_ref(player_ent), match.is_ref(combo_after))
        mocks:assert("combo_sound", "on_dummy_create").not_called_with(match.is_ref(dummy))
        mocks:assert("combo_sound", "on_combo_stop").called_with(match.is_ref(player_ent))
        mocks:assert("combo_sound", "on_combo_start").called_with(match.is_ref(player_ent))
        mocks
          :assert("combo_comms", "send_started")
          .called_with(match.is_ref(player_ent), match.is_ref(combo_after))
        mocks
          :assert("combo_comms", "send_stopped")
          .called_with(match.is_ref(player_ent), match.is_ref(combo_before))
      end)
    end)
  end)

  describe(":on_stop", function()
    before_each(function()
      mocks:spy("combo_hero", combo_hero, "teardown")
      mocks:spy("combo_sound", combo_sound, "on_combo_stop")
      mocks:spy("combo_comms", combo_comms, "send_stopped")
    end)

    after_each(function()
      mocks:reset("combo_hero", "teardown")
      mocks:reset("combo_sound", "on_combo_stop")
      mocks:reset("combo_comms", "send_stopped")
    end)

    describe("when no combo is active", function()
      it("throws an error", function()
        assert.error(function()
          combos:on_stop(player_ent)
        end, "Player 13 has no active combo")

        mocks:assert("combo_hero", "teardown").called(0)
        mocks:assert("combo_sound", "on_combo_stop").called(0)
        mocks:assert("combo_comms", "send_stopped").called(0)
      end)
    end)

    describe("when a combo is active", function()
      it("stops the active combo", function()
        combos:on_start(player_ent, combos:create(13))

        local combo_before = player_state.combo
        local dummy_before = player_state.dummy

        assert.is_not_nil(combo_before) --- @cast combo_before invk.combo.Combo
        assert.is_not_nil(dummy_before) --- @cast dummy_before invk.dota2.DummyTarget
        assert.equal(13, combo_before.id)
        assert.is_true(dummy_before:is_alive())

        mocks:clear("combo_hero", "teardown")
        mocks:clear("combo_sound", "on_combo_stop")
        mocks:clear("combo_comms", "send_stopped")

        combos:on_stop(player_ent)

        local combo_after = player_state.combo
        local dummy_after = player_state.dummy

        assert.is_nil(combo_after) --- @cast combo_after invk.combo.Combo
        assert.is_not_nil(dummy_after) --- @cast dummy_after invk.dota2.DummyTarget
        assert.equal(dummy_before, dummy_after)
        assert.is_false(dummy_after:is_alive())

        mocks
          :assert("combo_hero", "teardown")
          .called_with(match.is_ref(player_ent), { hard_reset = true })
        mocks:assert("combo_sound", "on_combo_stop").called_with(match.is_ref(player_ent))
        mocks
          :assert("combo_comms", "send_stopped")
          .called_with(match.is_ref(player_ent), match.is_ref(combo_before))
      end)
    end)
  end)

  describe(":on_restart", function()
    before_each(function()
      mocks:spy("combo_comms", combo_comms, { "send_started", "send_stopped" })
      mocks:spy("combo_hero", combo_hero, { "setup", "teardown" })
      mocks:spy(
        "combo_sound",
        combo_sound,
        { "on_dummy_create", "on_combo_start", "on_combo_stop" }
      )
    end)

    after_each(function()
      mocks:reset("combo_comms", "send_started", "send_stopped")
      mocks:reset("combo_hero", "setup", "teardown")
      mocks:reset("combo_sound", "on_dummy_create", "on_combo_start", "on_combo_stop")
    end)

    describe("when no combo is active", function()
      it("throws an error", function()
        local restart_fn = m.bindn(combos.on_restart, combos, player_ent)

        assert.error(restart_fn, "Player 13 has no active combo")

        mocks:assert("combo_hero", "teardown").called(0)
        mocks:assert("combo_hero", "setup").called(0)
        mocks:assert("combo_sound", "on_dummy_create").called(0)
        mocks:assert("combo_sound", "on_combo_start").called(0)
        mocks:assert("combo_sound", "on_combo_stop").called(0)
        mocks:assert("combo_comms", "send_started").called(0)
        mocks:assert("combo_comms", "send_stopped").called(0)
      end)
    end)

    describe("when a combo is active", function()
      describe("without hard reset option", function()
        it("restarts the combo", function()
          combos:on_start(player_ent, combos:create(13))

          local combo_before = player_state.combo

          assert.is_not_nil(combo_before) --- @cast combo_before invk.combo.Combo
          assert.equal(13, combo_before.id)

          mocks:clear("combo_comms", "send_started", "send_stopped")
          mocks:clear("combo_hero", "setup", "teardown")
          mocks:clear("combo_sound", "on_dummy_create", "on_combo_start", "on_combo_stop")

          combos:on_restart(player_ent, { hard_reset = false })

          local combo_after = player_state.combo
          local dummy = player_state.dummy

          assert.is_not_nil(combo_after) --- @cast combo_after invk.combo.Combo
          assert.is_not_nil(dummy) --- @cast dummy invk.dota2.DummyTarget

          assert.are_not_equal(combo_after, combo_before)
          assert.equal(13, combo_after.id)
          assert.is_true(dummy:is_alive())

          mocks
            :assert("combo_hero", "teardown")
            .called_with(match.is_ref(player_ent), { hard_reset = false })
          mocks
            :assert("combo_hero", "setup")
            .called_with(match.is_ref(player_ent), match.is_ref(combo_after))
          mocks:assert("combo_sound", "on_dummy_create").not_called_with(match.is_ref(dummy))
          mocks:assert("combo_sound", "on_combo_stop").called(0)
          mocks:assert("combo_sound", "on_combo_start").called_with(match.is_ref(player_ent))
          mocks
            :assert("combo_comms", "send_started")
            .called_with(match.is_ref(player_ent), match.is_ref(combo_after))
          mocks:assert("combo_comms", "send_stopped").called(0)
        end)
      end)

      describe("with hard reset option", function()
        it("restarts the combo", function()
          combos:on_start(player_ent, combos:create(13))

          local combo_before = player_state.combo

          assert.is_not_nil(combo_before) --- @cast combo_before invk.combo.Combo
          assert.equal(13, combo_before.id)

          mocks:clear("combo_comms", "send_started", "send_stopped")
          mocks:clear("combo_hero", "setup", "teardown")
          mocks:clear("combo_sound", "on_dummy_create", "on_combo_start", "on_combo_stop")

          combos:on_restart(player_ent, { hard_reset = true })

          local combo_after = player_state.combo
          local dummy = player_state.dummy

          assert.is_not_nil(combo_after) --- @cast combo_after invk.combo.Combo
          assert.is_not_nil(dummy) --- @cast dummy invk.dota2.DummyTarget

          assert.are_not_equal(combo_after, combo_before)
          assert.equal(13, combo_after.id)
          assert.is_true(dummy:is_alive())

          mocks
            :assert("combo_hero", "teardown")
            .called_with(match.is_ref(player_ent), { hard_reset = true })
          mocks
            :assert("combo_hero", "setup")
            .called_with(match.is_ref(player_ent), match.is_ref(combo_after))
          mocks:assert("combo_sound", "on_dummy_create").not_called_with(match.is_ref(dummy))
          mocks:assert("combo_sound", "on_combo_stop").called(0)
          mocks:assert("combo_sound", "on_combo_start").called_with(match.is_ref(player_ent))
          mocks
            :assert("combo_comms", "send_started")
            .called_with(match.is_ref(player_ent), match.is_ref(combo_after))
          mocks:assert("combo_comms", "send_stopped").called(0)
        end)
      end)
    end)
  end)

  describe(":on_progress", function()
    --- @type invk.combo.Combo
    local combo

    before_each(function()
      --- @type invk.combo.ComboSpec
      local combo_spec = {
        id = m.uniqueId("Combos_spec-Progress-%d"),
        specialty = S.Specialty.QuasWex,
        stance = S.Stance.Defensive,
        damage_rating = S.DamageRating.Brutal,
        difficulty_rating = S.DifficultyRating.LiterallyUnplayable,
        hero_level = 25,
        orbs = { 7, 7, 7 },
        talents = talents.select(
          Talents.L10_LEFT,
          Talents.L15_RIGHT,
          Talents.L20_RIGHT,
          Talents.L25_RIGHT
        ),
        gold = 1234,
        items = { "item_blink" },
        tags = { "late-game" },
        sequence = {
          { id = 1, name = AbilityName.COLD_SNAP, required = true, next = { 2, 3 } },
          { id = 2, name = AbilityName.GHOST_WALK, next = { 3 } },
          { id = 3, name = AbilityName.EMP, required = true },
        },
      }

      combo = Combo:new(combo_spec)

      mocks:spy("combos", combos, { "on_pre_finish", "on_fail" })
      mocks:spy(
        "combo_comms",
        combo_comms,
        { "send_in_progress", "send_progress", "send_step_error" }
      )
    end)

    after_each(function()
      mocks:reset("combos", "on_pre_finish", "on_fail")
      mocks:reset("combo_comms", "send_in_progress", "send_progress", "send_step_error")
    end)

    describe("with no active combo", function()
      it("does nothing", function()
        combos:on_progress(player_ent, F.ability({ name = AbilityName.COLD_SNAP }))

        mocks:assert("combos", "on_pre_finish").called(0)
        mocks:assert("combos", "on_fail").called(0)
        mocks:assert("combo_comms", "send_in_progress").called(0)
        mocks:assert("combo_comms", "send_progress").called(0)
        mocks:assert("combo_comms", "send_step_error").called(0)
      end)
    end)

    describe("with failed combo", function()
      it("does nothing", function()
        combos:on_start(player_ent, combo)
        combo:fail()
        combos:on_progress(player_ent, F.ability({ name = AbilityName.COLD_SNAP }))

        mocks:assert("combos", "on_pre_finish").called(0)
        mocks:assert("combos", "on_fail").called(0)
        mocks:assert("combo_comms", "send_in_progress").called(0)
        mocks:assert("combo_comms", "send_progress").called(0)
        mocks:assert("combo_comms", "send_step_error").called(0)
      end)
    end)

    describe("with pre-finished combo", function()
      it("does nothing", function()
        combos:on_start(player_ent, combo)

        assert.is_true(combo:progress(F.ability({ name = AbilityName.COLD_SNAP })))
        assert.is_true(combo:progress(F.ability({ name = AbilityName.GHOST_WALK })))
        assert.is_true(combo:progress(F.ability({ name = AbilityName.EMP })))
        assert.is_true(combo:pre_finish())

        assert.equal(State.PreFinished, combo.state)

        combos:on_progress(player_ent, F.ability({ name = AbilityName.COLD_SNAP }))

        mocks:assert("combos", "on_pre_finish").called(0)
        mocks:assert("combos", "on_fail").called(0)
        mocks:assert("combo_comms", "send_in_progress").called(0)
        mocks:assert("combo_comms", "send_progress").called(0)
        mocks:assert("combo_comms", "send_step_error").called(0)
      end)
    end)

    describe("with finished combo", function()
      it("does nothing", function()
        combos:on_start(player_ent, combo)

        assert.is_true(combo:progress(F.ability({ name = AbilityName.COLD_SNAP })))
        assert.is_true(combo:progress(F.ability({ name = AbilityName.GHOST_WALK })))
        assert.is_true(combo:progress(F.ability({ name = AbilityName.EMP })))
        assert.is_true(combo:pre_finish())
        assert.is_true(combo:finish())

        assert.equal(State.Finished, combo.state)

        combos:on_progress(player_ent, F.ability({ name = AbilityName.COLD_SNAP }))

        mocks:assert("combos", "on_pre_finish").called(0)
        mocks:assert("combos", "on_fail").called(0)
        mocks:assert("combo_comms", "send_in_progress").called(0)
        mocks:assert("combo_comms", "send_progress").called(0)
        mocks:assert("combo_comms", "send_step_error").called(0)
      end)
    end)

    describe("with regular active combo", function()
      before_each(function()
        combos:on_start(player_ent, combo)
      end)

      describe("with invocation ability", function()
        it("does nothing", function()
          combos:on_progress(player_ent, F.ability({ name = AbilityName.EXORT }))

          mocks:assert("combos", "on_pre_finish").called(0)
          mocks:assert("combos", "on_fail").called(0)
          mocks:assert("combo_comms", "send_in_progress").called(0)
          mocks:assert("combo_comms", "send_progress").called(0)
          mocks:assert("combo_comms", "send_step_error").called(0)
        end)
      end)

      describe("with incorrect ability", function()
        local ability = F.ability({ name = AbilityName.SUN_STRIKE })

        it("fails the combo", function()
          combos:on_progress(player_ent, ability)

          assert.equal(State.Failed, combo.state)

          mocks
            :assert("combos", "on_fail").self
            .called_with(match.is_ref(player_ent), match.is_ref(ability))
          mocks:assert("combo_comms", "send_in_progress").called(0)
          mocks:assert("combo_comms", "send_progress").called(0)
          mocks:assert("combo_comms", "send_step_error").called_with(player_ent, combo, ability)
        end)
      end)

      describe("with correct ability", function()
        it("progresses the combo", function()
          combos:on_progress(player_ent, F.ability({ name = AbilityName.COLD_SNAP }))

          mocks:assert("combos", "on_pre_finish").called(0)
          mocks:assert("combos", "on_fail").called(0)
          mocks:assert("combo_comms", "send_step_error").called(0)
          mocks
            :assert("combo_comms", "send_progress")
            .called_with(match.is_ref(player_ent), match.is_ref(combo))
        end)

        describe("when it's the first combo step", function()
          it("communicates that combo is in progress", function()
            local ability = F.ability({ name = AbilityName.COLD_SNAP })

            combos:on_progress(player_ent, ability)

            mocks
              :assert("combo_comms", "send_in_progress")
              .called_with(match.is_ref(player_ent), match.is_ref(combo))
          end)
        end)

        describe("when it's the last combo step", function()
          it("pre-finishes the combo", function()
            assert.is_true(combo:progress(F.ability({ name = AbilityName.COLD_SNAP })))
            assert.is_true(combo:progress(F.ability({ name = AbilityName.GHOST_WALK })))

            combos:on_progress(player_ent, F.ability({ name = AbilityName.EMP }))

            assert.equal(State.PreFinished, combo.state)

            mocks:assert("combos", "on_pre_finish").self.called_with(match.is_ref(player_ent))
            mocks:assert("combos", "on_fail").called(0)
          end)
        end)
      end)
    end)
  end)
end)

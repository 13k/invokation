local assert = require("luassert")

local F = require("support.factory")
local Mock = require("support.mock")

local DummyTarget = require("invk.dota2.dummy_target")
local UNITS = require("invk.const.units")
local units = require("invk.dota2.units")

describe("invk.dota2.DummyTarget", function()
  local mocks = Mock({
    ["units.create"] = function(self)
      local i = 0

      self:stub("units", units, "create", function()
        i = i + 1

        return F.dota_unit({ name = UNITS.DUMMY_TARGET, __test_index = i })
      end)
    end,
  })

  local spawn = F.dota_entity({ name = UNITS.DUMMY_TARGET_SPAWN })

  before_each(function()
    mocks:stub("Entities", Entities, "FindByName", function()
      return spawn
    end)

    mocks:setup("units.create")

    mocks:stub("units", units, "destroy", function()
      return nil
    end)
  end)

  after_each(function()
    mocks:reset()
  end)

  describe("constructor", function()
    it("finds and sets the spawn point entity", function()
      local dummy = DummyTarget:new({ spawn = false })

      assert.equal(spawn, dummy.spawn_ent)
    end)
  end)

  describe(":is_alive", function()
    it("returns true if the dummy unit exists", function()
      local dummy = DummyTarget:new({ spawn = true })

      assert.is_true(dummy:is_alive())
    end)

    it("returns false if the dummy unit doesn't exist", function()
      local dummy = DummyTarget:new({ spawn = false })

      assert.is_false(dummy:is_alive())
    end)
  end)

  describe(":is_dead", function()
    it("returns false if the dummy unit exists", function()
      local dummy = DummyTarget:new({ spawn = true })

      assert.is_false(dummy:is_dead())
    end)

    it("returns true if the dummy unit doesn't exist", function()
      local dummy = DummyTarget:new({ spawn = false })

      assert.is_true(dummy:is_dead())
    end)
  end)

  describe(":spawn", function()
    it("does NOT spawn the dummy unit if it exists", function()
      local dummy = DummyTarget:new({ spawn = true })

      assert.is_not_nil(dummy.entity)
      assert.equal(1, dummy.entity.__test_index)

      dummy:spawn()

      assert.is_not_nil(dummy.entity)
      assert.equal(1, dummy.entity.__test_index)

      mocks:assert("units", "create").called(1)
      mocks:assert("units", "create").called_with(UNITS.DUMMY_TARGET, {
        location = spawn:GetAbsOrigin(),
        team = DOTA_TEAM_BADGUYS,
      })
    end)

    it("spawns the dummy unit if it doesn't exist", function()
      local dummy = DummyTarget:new({ spawn = false })

      assert.is_nil(dummy.entity)

      dummy:spawn()

      assert.is_not_nil(dummy.entity)
      assert.equal(1, dummy.entity.__test_index)
      mocks:assert("units", "create").called(1)
      mocks:assert("units", "create").called_with(UNITS.DUMMY_TARGET, {
        location = spawn:GetAbsOrigin(),
        team = DOTA_TEAM_BADGUYS,
      })
    end)
  end)

  describe(":kill", function()
    it("does NOT kill the dummy unit if it doesn't exist", function()
      local dummy = DummyTarget:new({ spawn = false })

      assert.is_nil(dummy.entity)

      dummy:kill()

      assert.is_nil(dummy.entity)
      mocks:assert("units", "destroy").called(0)
    end)

    it("kills the dummy unit if it exists", function()
      local dummy = DummyTarget:new({ spawn = true })

      assert.is_not_nil(dummy.entity)

      dummy:kill()

      assert.is_nil(dummy.entity)
      mocks:assert("units", "destroy").called(1)
    end)
  end)

  describe(":reset", function()
    it("spawns the dummy unit if it doesn't exist", function()
      local dummy = DummyTarget:new({ spawn = false })

      mocks:spy("DummyTarget", dummy, { "kill", "spawn" })

      assert.is_nil(dummy.entity)

      dummy:reset()

      assert.is_not_nil(dummy.entity)
      assert.equal(1, dummy.entity.__test_index)
      mocks:assert("DummyTarget", "kill").called(1)
      mocks:assert("DummyTarget", "spawn").called(1)
    end)

    it("respawns the dummy unit if it exists", function()
      local dummy = DummyTarget:new({ spawn = true })

      mocks:spy("DummyTarget", dummy, { "kill", "spawn" })

      assert.is_not_nil(dummy.entity)
      assert.equal(1, dummy.entity.__test_index)

      dummy:reset()

      assert.is_not_nil(dummy.entity)
      assert.equal(2, dummy.entity.__test_index)
      mocks:assert("DummyTarget", "kill").called(1)
      mocks:assert("DummyTarget", "spawn").called(1)
    end)
  end)
end)

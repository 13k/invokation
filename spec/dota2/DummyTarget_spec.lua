local create = require("support.factory").create

local Units = require("invokation.dota2.units")
local DummyTarget = require("invokation.dota2.DummyTarget")

describe("dota2.DummyTarget", function()
  local function stubUnitsCreate()
    local i = 0

    stub.new(Units, "Create", function()
      i = i + 1
      return create("dota_unit", { name = Units.DUMMY_TARGET, __test_index = i })
    end)
  end

  local spawn = create("entity", { name = Units.DUMMY_TARGET_SPAWN })

  before_each(function()
    stub.new(Entities, "FindByName", function()
      return spawn
    end)

    stubUnitsCreate()

    stub.new(Units, "Destroy", function()
      return nil
    end)
  end)

  after_each(function()
    -- selene: allow(incorrect_standard_library_use)
    Entities.FindByName:revert()
    Units.Create:revert()
    Units.Destroy:revert()
  end)

  describe("constructor", function()
    it("finds and sets the spawn point entity", function()
      local dummy = DummyTarget({ spawn = false })

      assert.equal(spawn, dummy.spawn)
    end)
  end)

  describe("#IsAlive", function()
    it("returns true if the dummy unit exists", function()
      local dummy = DummyTarget({ spawn = true })

      assert.is_true(dummy:IsAlive())
    end)

    it("returns false if the dummy unit doesn't exist", function()
      local dummy = DummyTarget({ spawn = false })

      assert.is_false(dummy:IsAlive())
    end)
  end)

  describe("#IsDead", function()
    it("returns false if the dummy unit exists", function()
      local dummy = DummyTarget({ spawn = true })

      assert.is_false(dummy:IsDead())
    end)

    it("returns true if the dummy unit doesn't exist", function()
      local dummy = DummyTarget({ spawn = false })

      assert.is_true(dummy:IsDead())
    end)
  end)

  describe("#Spawn", function()
    it("does NOT spawn the dummy unit if it exists", function()
      local dummy = DummyTarget({ spawn = true })

      assert.not_nil(dummy.entity)
      assert.equal(1, dummy.entity.__test_index)

      dummy:Spawn()

      assert.not_nil(dummy.entity)
      assert.equal(1, dummy.entity.__test_index)
      assert.spy(Units.Create).was.called(1)
      assert.spy(Units.Create).was.called_with(Units.DUMMY_TARGET, {
        location = spawn:GetAbsOrigin(),
        team = DOTA_TEAM_BADGUYS,
      })
    end)

    it("spawns the dummy unit if it doesn't exist", function()
      local dummy = DummyTarget({ spawn = false })

      assert.is_nil(dummy.entity)

      dummy:Spawn()

      assert.not_nil(dummy.entity)
      assert.equal(1, dummy.entity.__test_index)
      assert.spy(Units.Create).was.called(1)
      assert.spy(Units.Create).was.called_with(Units.DUMMY_TARGET, {
        location = spawn:GetAbsOrigin(),
        team = DOTA_TEAM_BADGUYS,
      })
    end)
  end)

  describe("#Kill", function()
    it("does NOT kill the dummy unit if it doesn't exist", function()
      local dummy = DummyTarget({ spawn = false })

      assert.is_nil(dummy.entity)

      dummy:Kill()

      assert.is_nil(dummy.entity)
      assert.spy(Units.Destroy).was.not_called()
    end)

    it("kills the dummy unit if it exists", function()
      local dummy = DummyTarget({ spawn = true })

      assert.not_nil(dummy.entity)

      dummy:Kill()

      assert.is_nil(dummy.entity)
      assert.spy(Units.Destroy).was.called(1)
    end)
  end)

  describe("#Reset", function()
    it("spawns the dummy unit if it doesn't exist", function()
      local dummy = DummyTarget({ spawn = false })
      local killSpy = spy.on(dummy, "Kill")
      local spawnSpy = spy.on(dummy, "Spawn")

      assert.is_nil(dummy.entity)

      dummy:Reset()

      assert.not_nil(dummy.entity)
      assert.equal(1, dummy.entity.__test_index)
      assert.spy(killSpy).was.called(1)
      assert.spy(spawnSpy).was.called(1)
    end)

    it("respawns the dummy unit if it exists", function()
      local dummy = DummyTarget({ spawn = true })
      local killSpy = spy.on(dummy, "Kill")
      local spawnSpy = spy.on(dummy, "Spawn")

      assert.not_nil(dummy.entity)
      assert.equal(1, dummy.entity.__test_index)

      dummy:Reset()

      assert.not_nil(dummy.entity)
      assert.equal(2, dummy.entity.__test_index)
      assert.spy(killSpy).was.called(1)
      assert.spy(spawnSpy).was.called(1)
    end)
  end)
end)

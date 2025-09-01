local assert = require("luassert")

local F = require("support.factory")
local MockClock = require("support.dota2.clock")

local INVOKER = require("invk.const.invoker")
local Wait = require("invk.combo.wait")

local AbilityName = INVOKER.AbilityName

describe("invk.combo.Wait", function()
  --- @type support.dota2.MockClock
  local clock = MockClock(10, true)
  --- @type invk.combo.Wait
  local wait

  before_each(function()
    wait = Wait:new(clock)
  end)

  describe(":enqueue", function()
    describe("with abilities without special wait values", function()
      local ability1 = F.ability({
        name = "step1",
        AbilityDuration = 0.5,
      })

      local ability2 = F.ability({
        name = "step2",
        AbilityDuration = 0.3,
      })

      local ability3 = F.ability({
        name = "step3",
        AbilityDuration = 0.25,
      })

      it("enqueues the abilities durations", function()
        assert.same({}, wait.queue)

        wait:enqueue(ability1)

        assert.same({ 10.5 }, wait.queue)

        wait:enqueue(ability2)

        assert.same({ 10.5, 10.3 }, wait.queue)

        wait:enqueue(ability3)

        assert.same({ 10.5, 10.3, 10.25 }, wait.queue)
      end)
    end)

    describe("with abilities with special wait values", function()
      local ability_alacrity = F.ability({
        name = AbilityName.ALACRITY,
        AbilityDuration = 1.0,
        special = { duration = 3.5 },
      })

      local ability_cold_snap = F.ability({
        name = AbilityName.COLD_SNAP,
        AbilityDuration = 2.0,
        special = { duration = 1.25 },
      })

      local ability_sun_strike = F.ability({
        name = AbilityName.SUN_STRIKE,
        special = { delay = 2.6 },
      })

      it("enqueues the abilities durations with special values", function()
        assert.same({}, wait.queue)

        wait:enqueue(ability_alacrity)

        assert.same({ 14.5 }, wait.queue)

        wait:enqueue(ability_cold_snap)

        assert.same({ 14.5, 13.25 }, wait.queue)

        wait:enqueue(ability_sun_strike)

        assert.same({ 14.5, 13.25, 12.6 }, wait.queue)
      end)
    end)
  end)

  describe(":finish", function()
    local ability_alacrity = F.ability({
      name = AbilityName.ALACRITY,
      AbilityDuration = 1.0,
      special = { duration = 3.5 },
    })

    local ability_cold_snap = F.ability({
      name = AbilityName.COLD_SNAP,
      AbilityDuration = 2.0,
      special = { duration = 1.25 },
    })

    local ability_sun_strike = F.ability({
      name = AbilityName.SUN_STRIKE,
      special = { delay = 2.6 },
    })

    it("sets duration from max enqueued time, relative to the given base time", function()
      wait:enqueue(ability_alacrity)
      wait:enqueue(ability_cold_snap)
      wait:enqueue(ability_sun_strike)

      assert.same({ 14.5, 13.25, 12.6 }, wait.queue)

      wait:finish(5.0)

      assert.equal(9.5, wait.duration)
    end)
  end)
end)

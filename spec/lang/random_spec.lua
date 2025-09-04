local Mock = require("support.mock")

local rand = require("invk.lang.random")

describe("invk.lang.random", function()
  describe(".seed", function()
    local mocks = Mock()

    before_each(function()
      mocks:spy("math", math, "randomseed")
    end)

    after_each(function()
      mocks:revert("math", "randomseed")
    end)

    it("seeds `math`s random with the given value", function()
      rand.seed(13)

      mocks:assert("math", "randomseed").called_with(13)
    end)

    describe("with default value", function()
      before_each(function()
        -- selene: allow(global_usage)
        mocks:stub("_G", _G, "Time", 31)
      end)

      after_each(function()
        mocks:revert("_G", "Time")
      end)

      it("seeds `math`s random with a default value", function()
        rand.seed()

        mocks:assert("_G", "Time").called(1)
        mocks:assert("math", "randomseed").called_with(31)
      end)
    end)
  end)
end)

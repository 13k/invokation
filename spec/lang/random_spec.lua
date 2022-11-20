local rand = require("invokation.lang.random")

describe("function", function()
  describe(".seed", function()
    local spyMathRandomSeed

    before_each(function()
      spyMathRandomSeed = spy.on(math, "randomseed")
    end)

    after_each(function()
      spyMathRandomSeed:revert()
    end)

    it("seeds `math`s random with the given value", function()
      rand.seed(13)

      assert.spy(spyMathRandomSeed).was.called_with(13)
    end)

    describe("with default value", function()
      local stubTime

      before_each(function()
        -- selene: allow(global_usage)
        stubTime = stub.new(_G, "Time", 31)
      end)

      after_each(function()
        stubTime:revert()
      end)

      it("seeds `math`s random with a default value", function()
        rand.seed()

        assert.stub(stubTime).was_called(1)
        assert.spy(spyMathRandomSeed).was.called_with(31)
      end)
    end)
  end)
end)

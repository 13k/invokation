local assert = require("luassert")

local Mock = require("support.mock")

local func = require("invk.lang.function")

describe("invk.lang.function", function()
  describe(".lookupbyname", function()
    it("creates a wrapper function that performs method lookup by name", function()
      local mocks = Mock()
      local t = {}

      t.greet = function(name)
        return "Greetings, " .. name
      end

      mocks:spy("t", t, "greet")

      local fn = func.lookupbyname(t, "greet")

      assert.is_function(fn)
      assert.are_not_equal(t.greet, fn)
      assert.equal("Greetings, Alice", fn("Alice"))
      mocks:assert("t", "greet").called_with("Alice")

      mocks:reset()

      t.greet = function(name)
        return "Welcome, " .. name
      end

      mocks:spy("t", t, "greet")

      assert.equal("Welcome, Bob", fn("Bob"))
      mocks:assert("t", "greet").called_with("Bob")
    end)
  end)
end)

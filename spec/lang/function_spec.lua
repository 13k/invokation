local func = require("invokation.lang.function")

describe("function", function()
  describe(".lookupbyname", function()
    it("creates a wrapper function that performs method lookup by name", function()
      local t = {}

      t.greet = function(name)
        return "Greetings, " .. name
      end

      local greetSpy = spy.on(t, "greet")
      local fn = func.lookupbyname(t, "greet")

      assert.is_function(fn)
      assert.are_not.equal(t.greet, fn)
      assert.are.equal("Greetings, Alice", fn("Alice"))
      assert.spy(greetSpy).was.called_with("Alice")

      t.greet = function(name)
        return "Welcome, " .. name
      end

      greetSpy = spy.on(t, "greet")

      assert.are.equal("Welcome, Bob", fn("Bob"))
      assert.spy(greetSpy).was.called_with("Bob")
    end)
  end)
end)

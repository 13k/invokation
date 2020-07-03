local class = require("pl.class")
local delegation = require("invokation.lang.delegation")

describe("delegation", function()
  describe(".delegate", function()
    local Engine = class()

    -- luacheck: no self
    function Engine:start()
      return "engine started"
    end

    -- luacheck: no self
    function Engine:shutdown()
      return "engine stopped"
    end

    local Car = class()

    function Car:_init(e)
      self.engine = e
    end

    delegation.delegate(Car, "engine", {"start", "shutdown"})

    local engine, car
    local spyStart, spyShutdown

    before_each(function()
      engine = Engine()
      car = Car(engine)
      spyStart = spy.on(engine, "start")
      spyShutdown = spy.on(engine, "shutdown")
    end)

    after_each(function()
      spyStart:revert()
      spyShutdown:revert()
    end)

    it("creates delegated methods in the target class object", function()
      assert.is_function(Car.start)
      assert.is_function(Car.shutdown)
      assert.is_function(car.start)
      assert.is_function(car.shutdown)
    end)

    it("creates methods that delegate to the named attribute", function()
      assert.are.equal("engine started", car:start())
      assert.are.equal("engine stopped", car:shutdown())

      assert.spy(spyStart).was.called_with(engine)
      assert.spy(spyShutdown).was.called_with(engine)
    end)
  end)
end)

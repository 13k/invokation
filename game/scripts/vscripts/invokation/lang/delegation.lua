--- Method delegation helpers.
-- @module invokation.lang.delegation

local M = {}

--- Creates delegator instance methods in a class.
--
-- Creates methods in the given class object that simply delegate
-- to the respective methods in the named attribute object.
--
-- @usage
--   delegate(Class, "attribute", "method")
--   -- is equivalent to
--   function Class:method(...)
--     self.attribute:method(...)
--   end
--
-- @usage
--   local class = require("pl.class")
--   local Engine = class()
--
--   function Engine:start()
--     print("engine started")
--   end
--
--   function Engine:shutdown()
--     print("engine stopped")
--   end
--
--   local Car = class()
--
--   delegate(Car, "engine", {"start", "shutdown"})
--
--   function Car:_init(engine)
--     self.engine = engine
--   end
--
--   local engine = Engine()
--   local car = Car(engine)
--
--   car:start() --> engine started
--   car:shutdown() --> engine stopped
--
-- @tparam table classObject Class object
-- @tparam string delegateTo Attribute name that methods are delegated to
-- @tparam string|array(string) methods Method name or list of names to delegate
function M.delegate(classObject, delegateTo, methods)
  if type(methods) == "string" then
    methods = { methods }
  end

  for _, method in ipairs(methods) do
    classObject[method] = function(self, ...)
      local attr = self[delegateTo]
      return attr[method](attr, ...)
    end
  end
end

return M
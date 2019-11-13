local Factory = require("support.factory")
local Unit = require("invokation.dota2.Unit")

Factory.define("unit", function(attributes)
  return Unit(Factory.create("dota_unit", attributes))
end)

local Factory = require("support.factory")
local Unit = require("invokation.dota2.Unit")

Factory.define("hero", function(attributes, options)
  return Unit(Factory.create("dota_hero", attributes, options))
end)

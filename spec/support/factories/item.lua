local Factory = require("support.factory")
local Ability = require("invokation.dota2.Ability")

Factory.define("item", function(attributes)
  return Ability(Factory.create("dota_item", attributes))
end)

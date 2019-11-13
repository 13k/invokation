local Factory = require("support.factory")
local Ability = require("invokation.dota2.Ability")

Factory.define("ability", function(attributes)
  return Ability(Factory.create("dota_ability", attributes))
end)

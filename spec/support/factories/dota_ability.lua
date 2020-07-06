local m = require("moses")
local Factory = require("support.factory")

local ABILITIES = require("invokation.const.abilities")

Factory.define("dota_ability", function(attributes)
  attributes = attributes or {}
  attributes = m.extend({}, ABILITIES.KEY_VALUES[attributes.name] or {}, attributes)

  return CDOTABaseAbility(attributes)
end)

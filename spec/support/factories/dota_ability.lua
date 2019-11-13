local Factory = require("support.factory")
local m = require("moses")

local KEY_VALUES = LoadKeyValues("scripts/npc/npc_abilities.txt")

Factory.define("dota_ability", function(attributes)
  return CDOTABaseAbility(m.extend({}, KEY_VALUES[attributes.name] or {}, attributes))
end)

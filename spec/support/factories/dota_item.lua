local m = require("moses")
local Factory = require("support.factory")

local KEY_VALUES = LoadKeyValues("scripts/npc/items.txt")

Factory.define("dota_item", function(attributes)
  return CDOTA_Item(m.extend({}, KEY_VALUES[attributes.name] or {}, attributes))
end)

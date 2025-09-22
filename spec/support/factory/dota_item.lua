local m = require("moses")

--- @class F.dota_item.Attributes : T.dota2.CDOTA_Item.Attributes

local CDOTA_Item = require("support.dota2.CDOTA_Item")

--- @param attributes F.dota_item.Attributes
--- @return T.dota2.CDOTA_Item
return function(attributes)
  local kv = LoadKeyValues("scripts/npc/items.txt")

  return CDOTA_Item(m.extend({}, kv[attributes.name] or {}, attributes))
end

local m = require("moses")

local CDOTA_Item = require("support.dota2.CDOTA_Item")

--- @param attributes support.dota2.CDOTA_Item_attributes
--- @return support.dota2.CDOTA_Item
return function(attributes)
  local kv = LoadKeyValues("scripts/npc/items.txt")

  return CDOTA_Item(m.extend({}, kv[attributes.name] or {}, attributes))
end

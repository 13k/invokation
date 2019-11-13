local Factory = require("support.factory")

Factory.define("dota_unit", function(attributes)
  return CDOTA_BaseNPC(attributes)
end)

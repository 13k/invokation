local Factory = require("support.factory")

Factory.define("entity", function(attributes)
  return CBaseEntity(attributes)
end)

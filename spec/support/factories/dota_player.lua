local Factory = require("support.factory")

Factory.define("dota_player", function(attributes)
  return CDOTAPlayer(attributes)
end)

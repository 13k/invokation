local Factory = require("support.factory")
local Player = require("invokation.dota2.Player")

Factory.define("player", function(attributes)
  return Player(Factory.create("dota_player", attributes))
end)

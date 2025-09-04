require("invk.lang.stub")
require("invk.lang.global")
require("compat53.init")

local GameMode = require("invk.game_mode")

function Precache(context)
  GameMode.precache(context)
end

function Activate()
  GameRules.Invokation = GameMode:new()
  GameRules.Invokation:activate()
end

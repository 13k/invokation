require("invokation.lang.stub")
require("invokation.dota2.classes")

local GameMode = require("invokation.GameMode")

function Precache(context)
  GameMode.Precache(context)
end

function Activate()
  GameRules.Invokation = GameMode()
  GameRules.Invokation:Activate()
end

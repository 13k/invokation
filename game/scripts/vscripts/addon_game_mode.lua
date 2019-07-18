require("invokation.lang.stub")

local GameMode = require("invokation.GameMode")
local gameMode = GameMode()

function Precache(context)
  gameMode:Precache(context)
end

function Activate()
  gameMode:Activate()
end

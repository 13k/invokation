if not IsInToolsMode() then
  require("lang/stub")
end

local GameMode = require("game_mode")

local _gameMode = GameMode()

function Precache(context)
  _gameMode:Precache(context)
end

function Activate()
  _gameMode:Activate()
end

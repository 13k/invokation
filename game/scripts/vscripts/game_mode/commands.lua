local Logger = require("lib.logger")
local lfunc = require("lang.function")

function GameMode:registerCommands()
  --[[
  Convars:RegisterCommand(
    "events_test",
    function()
      self:StartEventTest()
    end,
    "events test",
    0
  )
  ]]
  --[[
  Convars:RegisterCommand(
    "command_example",
    lfunc.bindbyname(GameMode, "ExampleConsoleCommand"),
    "A console command example",
    FCVAR_CHEAT
  )
  ]]
  Convars:RegisterCommand(
    "inv_debug",
    lfunc.bindbyname(self, "enableDebug"),
    "Enable Invokation debugging",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_debug_off",
    lfunc.bindbyname(self, "disableDebug"),
    "Disable Invokation debugging",
    FCVAR_CHEAT
  )

  self:d("  register commands")
end

function GameMode:enableDebug()
  self.logger.level = Logger.DEBUG
end

function GameMode:disableDebug()
  self.logger.level = Logger.INFO
end

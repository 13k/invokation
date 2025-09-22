--# selene: allow(incorrect_standard_library_use)

local CDOTABaseGameMode = require("support.dota2.CDOTABaseGameMode")

--- @class T.dota2.GameRules : CDOTAGameRules
GameRules = {}

function GameRules:GetGameModeEntity()
  if self.game_mode == nil then
    self.game_mode = CDOTABaseGameMode()
  end

  return self.game_mode
end

--- @diagnostic disable-next-line: unused
function GameRules:GetGameTime()
  return os.time()
end

--- @diagnostic disable-next-line: unused
function GameRules:NumDroppedItems()
  return 0
end

--- @diagnostic disable-next-line: unused
function GameRules:GetDroppedItem(_i)
  return nil
end

--- @diagnostic disable-next-line: unused
function GameRules:SetSpeechUseSpawnInsteadOfRespawnConcept(_b) end

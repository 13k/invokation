local CDOTABaseGameMode = require("support.dota2.CDOTABaseGameMode")

GameRules = {}

function GameRules:GetGameModeEntity()
  if self.game_mode == nil then
    self.game_mode = CDOTABaseGameMode()
  end

  return self.game_mode
end

function GameRules:GetGameTime()
  return os.time()
end

function GameRules:NumDroppedItems()
  return 0
end

function GameRules:GetDroppedItem(_i)
  return nil
end

function GameRules:SetSpeechUseSpawnInsteadOfRespawnConcept(_b) end

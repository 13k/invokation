-- selene: allow(incorrect_standard_library_use)
GameRules = {}

function GameRules:GetGameModeEntity()
  if self.gameMode == nil then
    self.gameMode = CDOTABaseGameMode()
  end

  return self.gameMode
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

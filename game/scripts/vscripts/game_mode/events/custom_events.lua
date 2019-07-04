function GameMode:OnComboStart(playerEntIdx, keys)
  self:d('OnComboStart()', playerEntIdx, keys)

  local combo = self.combos:Find(keys.name)
  local player = EntIndexToHScript(playerEntIdx);

  if combo == nil then
    self:d('  could not find combo', keys.name)
    return
  end

  self.combos:Start(player, combo)
end

function GameMode:OnComboStop(playerEntIdx, keys)
  self:d('OnComboStop()', playerEntIdx, keys)
  local player = EntIndexToHScript(playerEntIdx);
  self.combos:Stop(player)
end

function GameMode:OnCombatLogCaptureStart(playerEntIdx, keys)
  self:d('OnCombatLogCaptureStart()', playerEntIdx, keys)
  local player = EntIndexToHScript(playerEntIdx);
  self.combos:StartCapturingAbilities(player)
end

function GameMode:OnCombatLogCaptureStop(playerEntIdx, keys)
  self:d('OnCombatLogCaptureStop()', playerEntIdx, keys)
  local player = EntIndexToHScript(playerEntIdx);
  self.combos:StopCapturingAbilities(player)
end
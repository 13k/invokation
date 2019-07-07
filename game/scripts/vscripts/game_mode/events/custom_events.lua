function GameMode:OnComboStart(player, payload)
  self:d("OnComboStart()", player:GetPlayerID(), payload)

  local combo = self.combos:Find(payload.combo)

  if combo == nil then
    self:d("  could not find combo", payload.combo)
    return
  end

  self.combos:Start(player, combo)
end

function GameMode:OnComboStop(player, payload)
  self:d("OnComboStop()", player:GetPlayerID(), payload)
  self.combos:Stop(player)
end

function GameMode:OnCombatLogCaptureStart(player, payload)
  self:d("OnCombatLogCaptureStart()", player:GetPlayerID(), payload)
  self.combos:StartCapturingAbilities(player)
end

function GameMode:OnCombatLogCaptureStop(player, payload)
  self:d("OnCombatLogCaptureStop()", player:GetPlayerID(), payload)
  self.combos:StopCapturingAbilities(player)
end

--- Custom Events Listeners
-- @submodule invokation.GameMode

--- Custom Events Listeners
-- @section custom_events

--- Handles combo start events.
-- @tparam CDOTAPlayer player
-- @tparam table payload
-- @tparam string payload.combo Combo name
function GameMode:OnComboStart(player, payload)
  self:d("OnComboStart()", player:GetPlayerID(), payload)

  local combo = self.combos:Find(payload.combo)

  if combo == nil then
    self:d("  could not find combo", payload.combo)
    return
  end

  self.combos:Start(player, combo)
end

--- Handles combo stop events.
-- @tparam CDOTAPlayer player
-- @tparam table payload
function GameMode:OnComboStop(player, payload)
  self:d("OnComboStop()", player:GetPlayerID(), payload)
  self.combos:Stop(player)
end

--- Handles combo restart events.
-- @tparam CDOTAPlayer player
-- @tparam table payload
-- @tparam string payload.combo Combo name
function GameMode:OnComboRestart(player, payload)
  self:d("OnComboRestart()", player:GetPlayerID(), payload)

  local combo = self.combos:Find(payload.combo)

  if combo == nil then
    self:d("  could not find combo", payload.combo)
    return
  end

  self.combos:Restart(player, combo)
end

--- Handles combat log capture start events.
-- @tparam CDOTAPlayer player
-- @tparam table payload
function GameMode:OnCombatLogCaptureStart(player, payload)
  self:d("OnCombatLogCaptureStart()", player:GetPlayerID(), payload)
  self.combos:StartCapturingAbilities(player)
end

--- Handles combat log capture stop events.
-- @tparam CDOTAPlayer player
-- @tparam table payload
function GameMode:OnCombatLogCaptureStop(player, payload)
  self:d("OnCombatLogCaptureStop()", player:GetPlayerID(), payload)
  self.combos:StopCapturingAbilities(player)
end

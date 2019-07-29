--- Custom Events Listeners
-- @submodule invokation.GameMode

--- Custom Events Listeners
-- @section custom_events

--- Handles combo start events.
-- @tparam CDOTAPlayer player
-- @tparam table payload
-- @tparam string payload.combo Combo ID
function GameMode:OnComboStart(player, payload)
  self:d("OnComboStart()", player:GetPlayerID(), payload)
  self.combos:Start(player, payload.combo)
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
function GameMode:OnComboRestart(player, payload)
  self:d("OnComboRestart()", player:GetPlayerID(), payload)
  self.combos:Restart(player)
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

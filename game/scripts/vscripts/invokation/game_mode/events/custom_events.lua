--- Custom Events Listeners
-- @submodule invokation.GameMode
local CustomEvents = require("invokation.dota2.custom_events")

--- Custom Events Listeners
-- @section custom_events

--- Handles combos reload events.
-- @tparam CDOTAPlayer player
-- @tparam const.custom_events.CombosReloadPayload payload
function GameMode:OnCombosReload(player, payload)
  self:d("OnCombosReload", {player = player:GetPlayerID(), payload = payload})
  self.combos:load()
end

--- Handles combo start events.
-- @tparam CDOTAPlayer player
-- @tparam const.custom_events.ComboStartPayload payload
function GameMode:OnComboStart(player, payload)
  self:d("OnComboStart", {player = player:GetPlayerID(), payload = payload})

  local combo = self.combos:Create(payload.id)

  self.combos:Start(player, combo)
end

--- Handles combo stop events.
-- @tparam CDOTAPlayer player
-- @tparam const.custom_events.ComboStopPayload payload
function GameMode:OnComboStop(player, payload)
  self:d("OnComboStop", {player = player:GetPlayerID(), payload = payload})

  self.combos:Stop(player)
end

--- Handles combo restart events.
-- @tparam CDOTAPlayer player
-- @tparam const.custom_events.ComboRestartPayload payload
function GameMode:OnComboRestart(player, payload)
  self:d("OnComboRestart", {player = player:GetPlayerID(), payload = payload})

  local options = {hardReset = payload.hardReset == 1}

  self.combos:Restart(player, options)
end

--- Handles freestyle hero level up events.
-- @tparam CDOTAPlayer player
-- @tparam const.custom_events.FreestyleHeroLevelUpPayload payload
function GameMode:OnFreestyleHeroLevelUp(player, payload)
  self:d("OnFreestyleHeroLevelUp", {player = player:GetPlayerID(), payload = payload})

  local options = {level = payload.level, maxLevel = payload.maxLevel == 1}

  self.combos:FreestyleHeroLevelUp(player, options)
end

--- Handles combat log capture start events.
-- @tparam CDOTAPlayer player
-- @tparam const.custom_events.CombatLogCaptureStartPayload payload
function GameMode:OnCombatLogCaptureStart(player, payload)
  self:d("OnCombatLogCaptureStart", {player = player:GetPlayerID(), payload = payload})

  self.combos:StartCapturingAbilities(player)
end

--- Handles combat log capture stop events.
-- @tparam CDOTAPlayer player
-- @tparam const.custom_events.CombatLogCaptureStopPayload payload
function GameMode:OnCombatLogCaptureStop(player, payload)
  self:d("OnCombatLogCaptureStop", {player = player:GetPlayerID(), payload = payload})

  self.combos:StopCapturingAbilities(player)
end

--- Handles item picker query events.
-- @tparam CDOTAPlayer player
-- @tparam const.custom_events.ItemPickerQueryPayload payload
function GameMode:OnItemPickerQuery(player, payload)
  self:d("OnItemPickerQuery", {player = player:GetPlayerID(), payload = payload})

  local response = {items = self.itemsKV:Search(payload.query)}

  CustomEvents.SendPlayer(CustomEvents.EVENT_ITEM_PICKER_QUERY_RESPONSE, player, response)
end

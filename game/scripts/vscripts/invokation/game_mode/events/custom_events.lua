--- Custom Events Listeners
-- @submodule invokation.GameMode

--- Custom Events Listeners
-- @section custom_events

local CustomEvents = require("invokation.dota2.custom_events")

--- Handles combos reload events.
function GameMode:OnCombosReload()
  self:d("OnCombosReload()")
  self.combos:load()
end

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
-- @tparam[opt=false] bool payload.hardReset Hard reset
function GameMode:OnComboRestart(player, payload)
  self:d("OnComboRestart()", player:GetPlayerID(), payload)
  local hardReset = payload.hardReset == 1
  self.combos:Restart(player, {hardReset = hardReset})
end

--- Handles freestyle hero level up events.
-- @tparam CDOTAPlayer player
-- @tparam table payload
-- @tparam[opt] int options.level Level up to specified level
-- @tparam[opt=false] bool payload.maxLevel Level up to max level
function GameMode:OnFreestyleHeroLevelUp(player, payload)
  self:d("OnFreestyleHeroLevelUp()", player:GetPlayerID(), payload)
  self.combos:FreestyleHeroLevelUp(player, payload)
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

--- Handles item picker query events.
-- @tparam CDOTAPlayer player
-- @tparam table payload
function GameMode:OnItemPickerQuery(player, payload)
  self:d("OnItemPickerQuery()", player:GetPlayerID(), payload)
  local response = {items = self.itemsKV:Search(payload.query)}
  CustomEvents.SendPlayer(CustomEvents.EVENT_ITEM_PICKER_QUERY_RESPONSE, player, response)
end

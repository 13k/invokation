local class = require("middleclass")

--- Player class.
--- @class invk.dota2.Player : middleclass.Class
--- @field entity CDOTAPlayerController # player entity
--- @field id integer # player id
--- @field account_id integer # player's 32-bit account id
--- @field steam_id Uint64 # player's 64-bit steam id
--- @field hero CDOTA_BaseNPC_Hero # player's assigned hero entity
local M = class("invk.dota2.Player")

--- Constructor.
--- @param entity CDOTAPlayerController # Player entity
function M:initialize(entity)
  self.entity = entity
  self.id = self.entity:GetPlayerID()
  self.account_id = PlayerResource:GetSteamAccountID(self.id)
  self.steam_id = PlayerResource:GetSteamID(self.id)
  self.hero = self.entity:GetAssignedHero()
end

--- @class invk.dota2.player.ReplaceHeroOptions
--- @field gold? integer # New hero starting gold (default: `0`)
--- @field xp? integer # New hero starting experience (default: `0`)

--- Replaces the player's hero with a new one.
---
--- After replacing the hero, this Player instance's `hero` attribute will
--- reference the new entity.
--- @param hero_name string # Hero unit name
--- @param options? invk.dota2.player.ReplaceHeroOptions # Options table
--- @return CDOTA_BaseNPC_Hero # New hero entity
function M:replace_hero(hero_name, options)
  local opts = options or {}
  local gold = opts.gold or -1
  local xp = opts.xp or 0

  GameRules:SetSpeechUseSpawnInsteadOfRespawnConcept(true)

  PlayerResource:ReplaceHeroWithNoTransfer(self.id, hero_name, gold, xp)

  GameRules:SetSpeechUseSpawnInsteadOfRespawnConcept(false)

  self.hero:RemoveSelf()
  self.hero = self.entity:GetAssignedHero()

  return self.hero
end

--- Remove the player's owned units with given name.
--- @param unit_name string # Unit name
--- @return integer # The number of units removed
function M:remove_owned_units_by_name(unit_name)
  local to_remove = {}
  local ent = Entities:FindByName(nil, unit_name)

  while ent ~= nil do
    --- @cast ent CDOTA_BaseNPC
    if type(ent.GetPlayerOwner) == "function" then
      local owner = ent:GetPlayerOwner()

      if owner:GetPlayerID() == self.id then
        table.insert(to_remove, ent)
      end
    end

    ent = Entities:FindByName(ent, unit_name)
  end

  for _, ent_to_remove in ipairs(to_remove) do
    ent_to_remove:RemoveSelf()
  end

  return #to_remove
end

return M

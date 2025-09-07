local class = require("middleclass")

local INVOKER = require("invk.const.invoker")

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

--- Replaces the player's hero with a new one of the same unit name with an optional variant.
---
--- If `variant` is not given, uses the same existing variant.
---
--- After replacing the hero, this Player instance's `hero` attribute will
--- reference the new entity.
---
--- Note: this is an async operation. Use `callback` option to make sure to use the new hero entity.
--- @param variant? invk.dota2.invoker.FacetVariant
--- @param options? invk.dota2.player.ReplaceHeroOptions # Options table
--- @param callback? fun(hero: CDOTA_BaseNPC_Hero)
function M:replace_hero_variant(variant, options, callback)
  local opts = options or {}
  local gold = opts.gold or -1
  local xp = opts.xp or 0
  local respawn_pos = self.hero:GetAbsOrigin()
  --- @type invk.dota2.invoker.FacetId
  local facet_id

  if variant then
    facet_id = INVOKER.FacetId.from_variant(variant)
  else
    facet_id = self.hero:GetHeroFacetID() --[[@as invk.dota2.invoker.FacetId]]
  end

  local result = DebugCreateHeroWithVariant(
    self.entity,
    self.hero:GetUnitName(),
    facet_id --[[@as integer]],
    self.hero:GetTeam(),
    false,
    --- @diagnostic disable-next-line: param-type-not-match
    --- @param hero CDOTA_BaseNPC_Hero
    function(hero)
      local inspect = require("inspect")

      local owner = hero:GetPlayerOwner()
      local owner_player_id = owner:GetPlayerID()

      owner:SetAssignedHeroEntity(nil)

      print(
        "DebugCreateHeroWithVariant",
        inspect({
          player_entidx = self.entity:GetEntityIndex(),
          owner_entidx = owner:GetEntityIndex(),
          owner_player_id = owner_player_id,
          is_fake_client = PlayerResource:IsFakeClient(owner_player_id),
        })
      )

      hero:SetOwner(self.entity)
      hero:SetPlayerID(self.id)
      hero:SetControllableByPlayer(self.id, false)

      if PlayerResource:IsFakeClient(owner_player_id) then
        GameRules:RemoveFakeClient(owner_player_id)
      end

      if gold > 0 then
        hero:ModifyGold(gold, true, DOTA_ModifyGold_Unspecified)
      end

      if xp > 0 then
        hero:AddExperience(xp, DOTA_ModifyXP_Unspecified, false, true)
      end

      hero:SetRespawnPosition(respawn_pos)

      FindClearSpaceForUnit(hero, respawn_pos, false)
      GameRules:SetSpeechUseSpawnInsteadOfRespawnConcept(true)

      self.entity:SetAssignedHeroEntity(hero)
      self.hero:ForceKill(false)
      self.hero:RemoveSelf()
      self.hero = hero

      print(
        "DebugCreateHeroWithVariant",
        inspect({
          team = hero:GetTeam(),
          unit = hero:GetUnitName(),
          facet = hero:GetHeroFacetID(),
          player_id = hero:GetPlayerID(),
          player_owner_id = hero:GetPlayerOwnerID(),
        })
      )

      GameRules:SetSpeechUseSpawnInsteadOfRespawnConcept(false)

      if callback then
        callback(hero)
      end
    end
  )

  print(F("DebugCreateHeroWithVariant result = %q", result))
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

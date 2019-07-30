--- Player class.
-- @classmod invokation.dota2.Player

local M = require("pl.class")()

--- Constructor.
--
-- Attributes:
--
-- * `entity`: (`CDOTAPlayer`) player entity
-- * `id`: (`int`) player ID
-- * `accountID`: (`int`) player's 32-bit account ID
-- * `steamID`: (`int`) player's 64-bit steam ID
-- * `hero`: (`CDOTA_BaseNPC_Hero`) player's assigned hero entity
--
-- @tparam CDOTAPlayer entity Player entity
function M:_init(entity)
  self.entity = entity
  self.id = self.entity:GetPlayerID()
  self.accountID = PlayerResource:GetSteamAccountID(self.id)
  self.steamID = PlayerResource:GetSteamID(self.id)
  self.hero = self.entity:GetAssignedHero()
end

--- Replaces the player's hero with a new one.
--
-- After replacing the hero, this Player instance's `hero` attribute will
-- reference the new entity.
--
-- @tparam string heroName Hero unit name
-- @tparam table options Options table
-- @tparam[opt=0] int options.gold New hero starting gold
-- @tparam[opt=0] int options.xp New hero starting experience
-- @tparam[opt=true] bool options.remove Remove old hero entity. Not removing
--   the entity will make it linger under the player's ownership and control
-- @treturn CDOTA_BaseNPC_Hero New hero entity
function M:ReplaceHero(heroName, options)
  local oldHero = self.hero

  options = options or {}
  options.gold = options.gold or 0
  options.xp = options.xp or 0
  options.remove = options.remove == nil and true or options.remove

  self.hero = PlayerResource:ReplaceHeroWith(self.id, heroName, options.gold, options.xp)

  if options.remove then
    oldHero:RemoveSelf()
  end

  return self.hero
end

--- Remove the player's owned units with given name.
-- @tparam string unitName Unit name
-- @treturn int The number of units removed
function M:RemoveOwnedUnitsByName(unitName)
  local toRemove = {}
  local ent = Entities:FindByName(nil, unitName)

  while ent ~= nil do
    if ent.GetPlayerOwner ~= nil then
      local owner = ent:GetPlayerOwner()

      if owner:GetPlayerID() == self.id then
        table.insert(toRemove, ent)
      end
    end

    ent = Entities:FindByName(ent, unitName)
  end

  for _, entToRemove in ipairs(toRemove) do
    entToRemove:RemoveSelf()
  end

  return #toRemove
end

return M

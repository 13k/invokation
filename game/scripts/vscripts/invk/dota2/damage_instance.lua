local class = require("middleclass")

--- DamageInstance class.
--- @class invk.dota2.DamageInstance : middleclass.Class
--- @field victim invk.dota2.Unit # Victim unit instance
--- @field amount number # Damage amount
--- @field attacker? invk.dota2.Unit # Attacker unit instance
--- @field inflictor? invk.dota2.Ability # Inflictor ability instance
--- @field category DamageCategory_t
local M = class("invk.dota2.DamageInstance")

--- Constructor.
--- @param victim invk.dota2.Unit # Victim unit instance
--- @param amount number # Damage amount
--- @param attacker? invk.dota2.Unit # Attacker unit instance
--- @param inflictor? invk.dota2.Ability # Inflictor ability instance
function M:initialize(victim, amount, attacker, inflictor)
  self.victim = victim
  self.amount = amount
  self.attacker = attacker
  self.inflictor = inflictor
  self.category = inflictor and DOTA_DAMAGE_CATEGORY_SPELL or DOTA_DAMAGE_CATEGORY_ATTACK
end

--- Returns the victim unit name.
--- @return string # Victim unit name
function M:victim_name()
  return self.victim.name
end

--- Returns the attacker unit name if it exists.
--- @return string? # Attacker unit name
function M:attacker_name()
  return self.attacker and self.attacker.name
end

--- Returns the player owner of the attacker unit if it exists.
--- @return CDOTAPlayerController? # Attacker player owner
function M:attacker_player_owner()
  return self.attacker and self.attacker.entity:GetPlayerOwner()
end

--- Returns the inflictor ability name if it exists.
--- @return string? # Inflictor ability name
function M:inflictor_name()
  return self.inflictor and self.inflictor.name
end

return M

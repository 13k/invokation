--- DamageInstance class.
-- @classmod invokation.dota2.DamageInstance

local class = require("pl.class")

local M = class()

--- Constructor.
-- @tparam Unit victim Victim unit instance
-- @tparam number amount Damage amount
-- @tparam[opt] Unit attacker Attacker unit instance
-- @tparam[opt] Ability inflictor Inflictor ability instance
function M:_init(victim, amount, attacker, inflictor)
  self.victim = victim
  self.amount = amount
  self.attacker = attacker
  self.inflictor = inflictor
  self.category = inflictor and DOTA_DAMAGE_CATEGORY_SPELL or DOTA_DAMAGE_CATEGORY_ATTACK
end

--- Returns the victim unit name.
-- @treturn string Victim unit name
function M:VictimName()
  return self.victim.name
end

--- Returns the attacker unit name if it exists.
-- @treturn ?string Attacker unit name
function M:AttackerName()
  return self.attacker and self.attacker.name
end

--- Returns the player owner of the attacker unit if it exists.
-- @treturn ?CDOTAPlayer Attacker player owner
function M:AttackerPlayerOwner()
  return self.attacker and self.attacker:GetPlayerOwner()
end

--- Returns the inflictor ability name if it exists.
-- @treturn ?string Inflictor ability name
function M:InflictorName()
  return self.inflictor and self.inflictor.name
end

return M
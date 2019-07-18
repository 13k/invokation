--- DamageInstance class.
-- @classmod invokation.dota2.DamageInstance

local M = require("pl.class")()

--- Constructor.
-- @tparam invokation.dota2.Unit victim Victim unit instance
-- @tparam number amount Damage amount
-- @tparam[opt] invokation.dota2.Unit attacker Attacker unit instance
-- @tparam[opt] invokation.dota2.Ability inflictor Inflictor ability instance
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
-- @treturn string|nil Attacker unit name
function M:AttackerName()
  return self.attacker and self.attacker.name
end

--- Returns the inflictor ability name if it exists.
-- @treturn string|nil Inflictor ability name
function M:InflictorName()
  return self.inflictor and self.inflictor.name
end

return M

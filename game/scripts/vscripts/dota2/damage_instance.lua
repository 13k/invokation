local M = require("pl.class")()

function M:_init(attacker, inflictor, victim, damage)
  self.attacker = attacker
  self.inflictor = inflictor
  self.victim = victim
  self.damage = damage
  self.category = inflictor and DOTA_DAMAGE_CATEGORY_SPELL or DOTA_DAMAGE_CATEGORY_ATTACK
end

function M:AttackerName()
  return self.attacker and self.attacker.name
end

function M:InflictorName()
  return self.inflictor and self.inflictor.name
end

function M:VictimName()
  return self.victim and self.victim.name
end

return M

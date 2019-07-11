local M = require("pl.class")()

M.CAUSE_ATTACK = "attack_damage"
M.CAUSE_ABILITY = "ability_damage"

function M:_init(attacker, inflictor, victim, damage)
  self.attacker = attacker
  self.inflictor = inflictor
  self.victim = victim
  self.damage = damage
  self.cause = inflictor and M.CAUSE_ABILITY or M.CAUSE_ATTACK
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

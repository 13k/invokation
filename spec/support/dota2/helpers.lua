local M = {}

--- @param hero CDOTA_BaseNPC_Hero
--- @param name string
function M.require_ability(hero, name)
  local message = string.format("could not find ability %q", name)
  local ability = assert(hero:FindAbilityByName(name), message)

  return ability
end

return M

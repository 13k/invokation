--- Table of enabled/disabled abilities.
--- @class invk.const.ability_list
local M = {
  item_tome_of_knowledge = false,
  item_courier = false,
  item_branches = false,
  item_quelling_blade = false,
  item_tpscroll = false,
  item_travel_boots = false,
  item_travel_boots_2 = false,
  item_phase_boots = false,
  item_power_treads = false,
  item_moon_shard = false,
}

--- @param ability invk.dota2.Ability
--- @return boolean
function M:is_ignored(ability)
  return self[ability.name] == false
end

return M

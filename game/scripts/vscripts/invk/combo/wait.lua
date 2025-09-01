local class = require("middleclass")

local INVOKER = require("invk.const.invoker")
local func = require("invk.lang.function")
local tbl = require("invk.lang.table")

local AbilityName = INVOKER.AbilityName

--- @type { [string]: string[] }
local WAIT_ABILITY_SPECIALS = {
  [AbilityName.ALACRITY] = { "duration" },
  [AbilityName.CHAOS_METEOR] = { "land_time", "burn_duration" },
  [AbilityName.COLD_SNAP] = { "duration" },
  [AbilityName.DEAFENING_BLAST] = { "disarm_duration" },
  [AbilityName.EMP] = { "delay" },
  [AbilityName.ICE_WALL] = { "duration" },
  [AbilityName.SUN_STRIKE] = { "delay" },
  [AbilityName.TORNADO] = { "lift_duration" },
  item_black_king_bar = { "duration" },
  item_cyclone = { "cyclone_duration" },
  item_sheepstick = { "sheep_duration" },
  item_shivas_guard = { "blast_debuff_duration" },
}

--- @class invk.combo.Wait : middleclass.Class
--- @field clock invk.dota2.ClockFn
--- @field queue number[]
--- @field duration number
local M = class("invk.combo.Wait")

--- @param clock invk.dota2.ClockFn
function M:initialize(clock)
  self.clock = clock
  self.queue = {}
  self.duration = 0
end

--- @param ability invk.dota2.Ability
--- @return number
function M.ability_wait(ability)
  local wait = ability:duration() or 0
  local special_keys = WAIT_ABILITY_SPECIALS[ability.name]

  if special_keys == nil then
    return wait
  end

  local special_waits = tbl.map(special_keys, function(special_key)
    return ability:get_special_value_for(special_key) or 0
  end)

  return tbl.reduce(special_waits, func.sum(), wait)
end

--- @param ability invk.dota2.Ability
function M:enqueue(ability)
  self.queue[#self.queue + 1] = self.clock() + M.ability_wait(ability)
end

--- @param base_time number
function M:finish(base_time)
  self.duration = self:max_time() - base_time
  self.queue = {}
end

--- @private
--- @return number
function M:max_time()
  --- @diagnostic disable-next-line: param-type-not-match
  return math.max(table.unpack(self.queue))
end

return M

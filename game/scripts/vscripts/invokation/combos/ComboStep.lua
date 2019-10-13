--- ComboStep class.
-- @classmod invokation.combos.ComboStep

local class = require("pl.class")
local tablex = require("pl.tablex")

local M = class()

--- Generates a state name from a given step.
-- @tparam ComboStep step Step instance
-- @treturn string State name
function M.StateName(step)
  return string.format("%d:%s", step.id, step.name)
end

--- Extracts a step id from a given state name.
-- @tparam string stateName State name
-- @treturn int Step id, if state name is valid
-- @treturn nil otherwise
function M.StepId(stateName)
  local id = stateName:match("^(%d+):")
  return id and tonumber(id) or nil
end

--- Generates an event name from a given step.
-- @tparam ComboStep step Step instance
-- @treturn string Event name
function M.EventName(step)
  return step.name
end

--- Constructor.
-- @tparam table spec ComboStep specification table
-- @tparam int spec.id Step ID
-- @tparam string spec.name Step name (ability or item name)
-- @tparam[opt=false] bool spec.required Is step required or optional?
-- @tparam[opt] {int,...} spec.next Next steps IDs (`nil` if it's the last step in the sequence)
function M:_init(spec)
  tablex.update(self, spec)

  self.state = M.StateName(self)
  self.event = M.EventName(self)
end

return M

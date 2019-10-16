--- ComboStep class.
-- @classmod invokation.combos.ComboStep

local class = require("pl.class")
local tablex = require("pl.tablex")

local M = class()

--- ComboStep specification.
-- @table Spec
-- @tfield int id Step id
-- @tfield string name Step name (ability or item name)
-- @tfield[opt=false] bool required Is step required or optional?
-- @tfield[opt] {int,...} next Next steps ids (`nil` if it's the last step in the sequence)

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
  return id and tonumber(id)
end

--- Generates an event name from a given step.
-- @tparam ComboStep step Step instance
-- @treturn string Event name
function M.EventName(step)
  return step.name
end

--- Constructor.
-- @tparam Spec spec Step data
function M:_init(spec)
  tablex.update(self, spec)

  self.state = M.StateName(self)
  self.event = M.EventName(self)
end

return M

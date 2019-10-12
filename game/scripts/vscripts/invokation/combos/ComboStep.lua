--- ComboStep class.
-- @classmod invokation.combos.ComboStep

local tablex = require("pl.tablex")

local M = require("pl.class")()

function M.StateName(step)
  return string.format("%d:%s", step.id, step.name)
end

function M.StepId(stateName)
  local id = stateName:match("^(%d+):")
  return id and tonumber(id) or nil
end

function M.EventName(step)
  return step.name
end

--- Constructor.
-- @tparam table spec ComboStep specification table
-- @tparam int spec.id Step ID
-- @tparam string spec.name Step name (ability or item name)
-- @tparam[opt=false] bool spec.required Is step required or optional?
-- @tparam[opt] array(int) spec.next Next steps IDs (`nil` if it's the last step in the sequence)
function M:_init(spec)
  tablex.update(self, spec)

  self.state = M.StateName(self)
  self.event = M.EventName(self)
end

return M
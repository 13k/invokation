local class = require("middleclass")

local tbl = require("invk.lang.table")

--- ComboStep class.
--- @class invk.combo.ComboStep : middleclass.Class, invk.combo.ComboStepSpec
--- @field state invk.combo.StateName
--- @field event invk.combo.EventName
local M = class("invk.combo.ComboStep")

--- Constructor.
--- @param data invk.combo.ComboStepSpec # Step data
function M:initialize(data)
  tbl.extend(self, data)

  self.state = M.gen_state_name(self)
  self.event = M.gen_event_name(self)
end

--- Generates a state name from a given step.
--- @param step invk.combo.ComboStep # Step instance
--- @return invk.combo.StateName # State name
function M.gen_state_name(step)
  return F("%d:%s", step.id, step.name)
end

--- Extracts a step id from a given state name.
--- @param state invk.combo.StateName # State name
--- @return integer? # Step id if state name is valid, `nil` otherwise
function M.extract_step_id(state)
  local id = state:match("^(%d+):")

  return id and (
      tonumber(id) --[[@as integer]]
    )
end

--- Generates an event name from a given step.
--- @param step invk.combo.ComboStep # Step instance
--- @return invk.combo.EventName # Event name
function M.gen_event_name(step)
  return step.name
end

return M

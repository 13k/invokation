local class = require("middleclass")

local BaseCombo = require("invk.combo.base_combo")
local ComboSequence = require("invk.combo.combo_sequence")
local Wait = require("invk.combo.wait")

local STATES = ComboSequence.STATES

--- Combo class.
--- @class invk.combo.Combo : invk.combo.BaseCombo
--- @field clock invk.dota2.ClockFn
--- @field sequence invk.combo.ComboSequence
--- @field wait invk.combo.Wait
local M = class("invk.combo.Combo", BaseCombo)

--- @class invk.combo.ComboOptions : invk.combo.BaseComboOptions
--- @field clock? invk.dota2.ClockFn # Clock function that returns the current time

--- Constructor.
--- @param spec invk.combo.ComboSpec # Combo data
--- @param options? invk.combo.ComboOptions # Options
function M:initialize(spec, options)
  BaseCombo.initialize(self, spec, options)

  local opts = options or {}

  self.clock = opts.clock or Time
  self.sequence = ComboSequence:new(self.id, self.sequence, { clock = self.clock })
  self.wait = Wait:new(self.clock)
end

--- Generates a DOT formatted string from the combo's FSM.
--- @return string # DOT string
function M:todot()
  return self.sequence:todot()
end

--- Returns the current step.
function M:current_step()
  return self.sequence.current
end

--- Returns the current next steps.
function M:next_steps()
  return self.sequence.next
end

--- Progresses the combo with the given ability if possible.
function M:progress(ability)
  local progressed = self.sequence:progress(ability.name)

  if progressed then
    self.state = BaseCombo.State.Started
    self.metrics.count = self.metrics.count + 1
    self.wait:enqueue(ability)
  end

  return progressed
end

--- Progresses combo to pre finish if possible.
function M:pre_finish()
  local pre_finish = self.sequence:pre_finish()

  if pre_finish then
    local enter_time = self.sequence:enter_time(STATES.PRE_FINISH) or 0

    self.state = BaseCombo.State.PreFinished
    self.wait:finish(enter_time)
  end

  return pre_finish
end

--- Finishes combo if possible.
function M:finish()
  local finished = self.sequence:finish()

  if finished then
    self.state = BaseCombo.State.Finished
    self.metrics.duration = self.sequence.duration
  end

  return finished
end

return M

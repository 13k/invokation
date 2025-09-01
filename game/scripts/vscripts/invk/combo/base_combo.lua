local class = require("middleclass")

local Logger = require("invk.logger")
local tbl = require("invk.lang.table")

local LOGNAME = "combo"
local ERR_NOT_IMPLEMENTED = "Not implemented"

--- @alias invk.combo.ComboId integer | string

--- @class invk.combo.Metrics
--- @field count integer # Abilities count since start
--- @field damage number # Accumulated damage since start
--- @field duration number # Duration since start

--- BaseCombo is a base class for combos.
--- @class invk.combo.BaseCombo : middleclass.Class, invk.log.Mixin, invk.combo.ComboSpec
--- @field state invk.combo.State
--- @field metrics invk.combo.Metrics
--- @field logger? invk.Logger
local M = class("invk.combo.BaseCombo")

M:include(Logger.Mixin)

--- Hard-coded freestyle combo id.
--- @type invk.combo.ComboId
M.FREESTYLE_COMBO_ID = "freestyle"

--- @enum invk.combo.State
M.State = {
  Initial = "initial",
  Started = "started",
  Failed = "failed",
  PreFinished = "pre_finished",
  Finished = "finished",
}

--- @class invk.combo.BaseComboOptions
--- @field logger? invk.Logger # Logger instance

--- Constructor.
--- @param spec invk.combo.ComboSpec # Combo data
--- @param options? invk.combo.BaseComboOptions # Options
function M:initialize(spec, options)
  local opts = options or {}

  tbl.extend(self, spec)

  self.state = M.State.Initial
  self.metrics = {
    count = 0,
    damage = 0,
    duration = 0,
  }

  if opts.logger then
    self.logger = opts.logger:child(LOGNAME)
  end
end

function M:is_freestyle()
  return self.id == M.FREESTYLE_COMBO_ID
end

function M:is_progressing_abilities()
  return self.state ~= M.State.Failed
    and self.state ~= M.State.PreFinished
    and self.state ~= M.State.Finished
end

function M:is_progressing_damage()
  return self.state == M.State.Started or self.state == M.State.PreFinished
end

--- Increments the total amount of damage dealt during this combo session.
--- @param amount number # Damage amount
--- @return number # Accumulated damage amount
function M:increment_damage(amount)
  self.metrics.damage = self.metrics.damage + amount

  return self.metrics.damage
end

--- Returns the current step.
--- @abstract Subclasses must override it.
--- @return invk.combo.ComboStep? # The current step or `nil`
--- @diagnostic disable-next-line: unused
function M:current_step()
  error(ERR_NOT_IMPLEMENTED)
end

--- @return integer?
function M:current_step_id()
  local step = self:current_step()

  return step and step.id
end

--- Returns the current next steps.
--- @abstract Subclasses must override it.
--- @return invk.combo.ComboStep[] # Array of next steps
--- @diagnostic disable-next-line: unused
function M:next_steps()
  error(ERR_NOT_IMPLEMENTED)
end

--- @return integer[]
function M:next_steps_ids()
  return tbl.map(self:next_steps(), function(step)
    return step.id
  end)
end

--- Progresses the combo with the given ability if possible.
--- @abstract Subclasses must override it.
--- @param _ability invk.dota2.Ability # Ability instance
--- @return boolean # `true` if succeeded, `false` otherwise
--- @diagnostic disable-next-line: unused
function M:progress(_ability)
  error(ERR_NOT_IMPLEMENTED)
end

--- Marks the combo as failed.
function M:fail()
  self.state = M.State.Failed
end

--- Progresses combo to pre finish if possible.
--- @abstract Subclasses must override it.
--- @return boolean # `true` if succeeded, `false` otherwise
--- @diagnostic disable-next-line: unused
function M:pre_finish()
  error(ERR_NOT_IMPLEMENTED)
end

--- Finishes the combo if possible.
--- @abstract Subclasses must override it.
--- @return boolean # `true` if succeeded, `false` otherwise
--- @diagnostic disable-next-line: unused
function M:finish()
  error(ERR_NOT_IMPLEMENTED)
end

return M

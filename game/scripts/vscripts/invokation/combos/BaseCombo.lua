--- BaseCombo is a base class for combos.
-- @classmod invokation.combos.BaseCombo

local class = require("pl.class")
local Logger = require("invokation.Logger")

local M = class()

local LOGGER_PROGNAME = "combo"

Logger.InstallHelpers(M)

--- Constructor.
-- @tparam[opt] table options Options
-- @tparam Logger options.logger Logger instance
function M:_init(options)
  options = options or {}

  self.logger = options.logger:Child(LOGGER_PROGNAME)
  self.started = false
  self.failed = false
  self.finished = false
  self.count = 0
  self.damage = 0
end

--- Returns the current step id.
-- @treturn ?int The current step id or `nil`
-- @abstract Subclasses must override it.
--
-- luacheck: no self
function M:CurrentStepId()
  error("Not implemented.")
end

--- Returns the current step.
-- @treturn ?combos.ComboStep The current step or `nil`
-- @abstract Subclasses must override it.
--
-- luacheck: no self
function M:CurrentStep()
  error("Not implemented.")
end

--- Returns the current next steps.
-- @treturn ?{combos.ComboStep,...} Array of next steps or `nil` if the combo is
--   at the last step
-- @abstract Subclasses must override it.
--
-- luacheck: no self
function M:NextSteps()
  error("Not implemented.")
end

--- Progresses the combo with the given ability if possible.
-- @tparam dota2.Ability ability Ability instance
-- @treturn bool `true` if succeeded, `false` otherwise
-- @abstract Subclasses must override it.
--
-- luacheck: no unused args
function M:Progress(ability)
  error("Not implemented.")
end

--- Marks the combo as failed.
function M:Fail()
  self.failed = true
end

--- Progresses combo to pre finish if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
-- @abstract Subclasses must override it.
--
-- luacheck: no self
function M:PreFinish()
  error("Not implemented.")
end

--- Finishes the combo if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
-- @abstract Subclasses must override it.
--
-- luacheck: no self
function M:Finish()
  error("Not implemented.")
end

--- Increments the total amount of damage dealt during this combo session.
-- @tparam int amount Damage amount
-- @treturn int Accumulated damage amount
function M:IncrementDamage(amount)
  self.damage = self.damage + amount
  return self.damage
end

return M

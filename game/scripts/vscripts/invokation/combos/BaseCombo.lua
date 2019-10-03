--- BaseCombo is a base class for combos.
-- @classmod invokation.combos.BaseCombo

local Logger = require("invokation.Logger")

local M = require("pl.class")()

local LOGGER_PROGNAME = "combo"

Logger.InstallHelpers(M)

--- Constructor.
-- @tparam[opt] table options Options
-- @tparam invokation.Logger options.logger Logger instance
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
-- @warning Abstract method. Subclasses must override it.
function M:CurrentStepId() -- luacheck: no self
  error("Not implemented.")
end

--- Returns the current step.
-- @treturn ?invokation.combos.ComboStep The current step or `nil`
-- @warning Abstract method. Subclasses must override it.
function M:CurrentStep() -- luacheck: no self
  error("Not implemented.")
end

--- Returns the current next steps.
-- @treturn array(invokation.combos.ComboStep)|nil List of next
--   @{invokation.combos.ComboStep} or `nil` if the combo is at the last step
-- @warning Abstract method. Subclasses must override it.
function M:NextSteps() -- luacheck: no self
  error("Not implemented.")
end

--- Progresses the combo with the given ability if possible.
-- @tparam invokation.dota2.Ability ability Ability instance
-- @treturn bool `true` if succeeded, `false` otherwise
-- @warning Abstract method. Subclasses must override it.
function M:Progress(ability) -- luacheck: no unused args
  error("Not implemented.")
end

--- Marks the combo as failed.
function M:Fail()
  self.failed = true
end

--- Progresses combo to pre finish if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
-- @warning Abstract method. Subclasses must override it.
function M:PreFinish() -- luacheck: no self
  error("Not implemented.")
end

--- Finishes the combo if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
-- @warning Abstract method. Subclasses must override it.
function M:Finish() -- luacheck: no self
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

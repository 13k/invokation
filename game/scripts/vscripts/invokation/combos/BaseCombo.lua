--- BaseCombo is a base class for combos.
-- @classmod invokation.combos.BaseCombo
local Logger = require("invokation.Logger")
local class = require("pl.class")
local moses = require("moses")

local M = class()

local LOGGER_PROGNAME = "combo"

Logger.Extend(M)

M.ERR_NOT_IMPLEMENTED = "Not implemented"

--- Combo specification.
-- @table Spec
-- @tfield string id id
-- @tfield string specialty Specialty
-- @tfield string stance Stance
-- @tfield int heroLevel Hero level
-- @tfield int damageRating Damage rating
-- @tfield int difficultyRating Difficulty rating
-- @tfield int gold Hero starting gold
-- @tfield {string,...} tags Tags
-- @tfield {string,...} items Array of required items names
-- @tfield {int,...} orbs Array of recommended orb abilities levels (`{quas, wex, exort}`)
-- @tfield int talents Bitmap of recommended talent abilities
-- @tfield {ComboStep.Spec,...} sequence Array of steps data

--- Constructor.
-- @tparam Spec spec Combo data
-- @tparam[opt] table options Options
-- @tparam Logger options.logger Logger instance
function M:_init(spec, options)
  options = options or {}

  moses.extend(self, spec)

  self.started = false
  self.failed = false
  self.preFinished = false
  self.finished = false
  self.count = 0
  self.damage = 0

  if options.logger then
    self.logger = options.logger:Child(LOGGER_PROGNAME)
  end
end

--- Returns the current step id.
-- @treturn ?int The current step id or `nil`
-- @abstract Subclasses must override it.
function M:CurrentStepId()
  error(M.ERR_NOT_IMPLEMENTED)
end

--- Returns the current step.
-- @treturn ?combos.ComboStep The current step or `nil`
-- @abstract Subclasses must override it.
function M:CurrentStep()
  error(M.ERR_NOT_IMPLEMENTED)
end

--- Returns the current next steps ids.
-- @treturn {int,...} Array of next steps ids
-- @abstract Subclasses must override it.
function M:NextStepsIds()
  error(M.ERR_NOT_IMPLEMENTED)
end

--- Returns the current next steps.
-- @treturn {ComboStep,...} Array of next steps
-- @abstract Subclasses must override it.
function M:NextSteps()
  error(M.ERR_NOT_IMPLEMENTED)
end

--- Progresses the combo with the given ability if possible.
-- @tparam dota2.Ability ability Ability instance
-- @treturn bool `true` if succeeded, `false` otherwise
-- @abstract Subclasses must override it.
function M:Progress(_ability)
  error(M.ERR_NOT_IMPLEMENTED)
end

--- Marks the combo as failed.
function M:Fail()
  self.failed = true
end

--- Progresses combo to pre finish if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
-- @abstract Subclasses must override it.
function M:PreFinish()
  error(M.ERR_NOT_IMPLEMENTED)
end

--- Finishes the combo if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
-- @abstract Subclasses must override it.
function M:Finish()
  error(M.ERR_NOT_IMPLEMENTED)
end

--- Increments the total amount of damage dealt during this combo session.
-- @tparam int amount Damage amount
-- @treturn int Accumulated damage amount
function M:IncrementDamage(amount)
  self.damage = self.damage + amount
  return self.damage
end

return M

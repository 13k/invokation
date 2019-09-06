--- Combo class.
-- @classmod invokation.combos.Combo

local M = require("pl.class")()

-- local pp = require("pl.pretty")
local fsm = require("invokation.fsm")
local tablex = require("pl.tablex")

local INITIAL_STATE = "start"
local FINISH_STATE = "finish"
local RESET_EVENT = "reset"
local FINISH_EVENT = "finish"

local function statename(step)
  return string.format("%d:%s", step.id, step.name)
end

local function eventname(step)
  return step.name
end

--- Combo step.
-- @field[type=int] id Step ID
-- @field[type=string] name Step name (ability or item name)
-- @field[type=bool] required Is step required or optional?
-- @field[type=array(int),opt] next Next steps IDs (`nil` if it's the last step in the sequence)
-- @table ComboStep

--- Constructor.
-- @tparam table spec Combo specification table
-- @tparam string spec.id ID
-- @tparam string spec.category Category
-- @tparam string spec.specialty Specialty
-- @tparam string spec.stance Stance
-- @tparam int spec.heroLevel Recommended hero level
-- @tparam int spec.damageRating Damage rating
-- @tparam int spec.difficultyRating Difficulty rating
-- @tparam array(string) spec.items List of required items names
-- @tparam array(ComboStep) spec.sequence List of @{ComboStep}
function M:_init(spec)
  tablex.update(self, spec)

  self:_createFSM()
  self.count = 0
  self.damage = 0
  self.failed = false

  -- print("Combo:_init()", self.name)
  -- pp.dump(self)
end

-- @todo Cache fsms?
function M:_createFSM()
  self.nextSteps = {}

  local steps = {{name = INITIAL_STATE, next = {self.sequence[1].id}}}
  local states = {FINISH_STATE}
  local events = {}

  tablex.insertvalues(steps, self.sequence)

  for _, step in ipairs(steps) do
    local state = step.name == INITIAL_STATE and INITIAL_STATE or statename(step)

    table.insert(states, state)
    self.nextSteps[state] = {}

    if step.next == nil then
      break
    end

    for _, nextId in ipairs(step.next) do
      local nextStep = self.sequence[nextId]
      local nextState = statename(nextStep)
      local event = {name = eventname(nextStep), from = state, to = nextState}

      table.insert(events, event)
      table.insert(self.nextSteps[state], nextStep)
    end
  end

  table.insert(events, {name = FINISH_EVENT, from = states[#states], to = FINISH_STATE})
  table.insert(events, {name = RESET_EVENT, from = states, to = INITIAL_STATE})

  self.fsm = fsm.create({initial = INITIAL_STATE, events = events})
end

--- Generates a DOT formatted string from the combo's fsm.
-- @treturn string DOT string
function M:todot()
  return self.fsm:todot()
end

--- Progresses the combo with the given ability if possible.
-- @tparam invokation.dota2.Ability ability Ability instance
-- @treturn bool `true` if combo progressed, `false` otherwise
-- @todo Receive a more generic event name instead of an ability
function M:Progress(ability)
  local eventFn = self.fsm[ability.name]

  if eventFn == nil then
    return nil
  end

  local progressed = eventFn(self.fsm)

  if progressed then
    self.count = self.count + 1
  end

  return progressed
end

--- Marks the combo as failed.
function M:Fail()
  self.failed = true
end

--- Finishes the combo if possible.
-- @treturn bool `true` if combo finished, `false` otherwise
function M:Finish()
  return self.fsm:finish()
end

--- Returns the current next steps.
-- @treturn array(ComboStep)|nil List of next @{ComboStep} or `nil` if the combo is at the last step
function M:NextSteps()
  return self.nextSteps[self.fsm.current]
end

--- Increments the total amount of damage dealt during this combo session.
-- @tparam int amount Damage amount
-- @treturn int Accumulated damage amount
function M:IncrementDamage(amount)
  self.damage = self.damage + amount
  return self.damage
end

return M

local M = require("pl.class")()

-- local pp = require('pl.pretty')
local fsm = require("vendor.fsm")
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

function M:_init(config)
  tablex.update(self, config)

  self:_createFSM()
  self.count = 0

  -- print('Combo:_init()', name)
  -- pp.dump(self)
end

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

function M:todot()
  return self.fsm:todot()
end

function M:Reset()
  if self.fsm:reset() then
    self.count = 0
    return true
  end

  return false
end

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

function M:Finish()
  return self.fsm:finish()
end

function M:NextSteps()
  return self.nextSteps[self.fsm.current]
end

return M

local module = require("pl.class")()

local fsm = require("vendor.fsm")
local ltable = require("lang.table")

local function createFSM(sequence)
  local events = {}
  local prevState = "start"

  for _, action in ipairs(sequence) do
    local nextState = action.name
    local event = {name = nextState, from = prevState, to = nextState}
    table.insert(events, event)
    prevState = nextState
  end

  local event = {name = "finish", from = prevState, to = "complete"}
  table.insert(events, event)

  return fsm.create(
    {
      initial = "start",
      events = events
    }
  )
end

function module:_init(name, config)
  self.id = "invokation_combo_" .. name
  self.name = name

  for k, v in pairs(ltable.except(config, "sequence")) do
    self[k] = v
  end

  self.fsm = createFSM(config.sequence)
end

return module

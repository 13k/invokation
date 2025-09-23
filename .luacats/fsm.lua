--# selene: allow(unused_variable)
--- @meta

--- @alias fsm.AsyncState
--- | "none"
--- | "async"

--- @generic S : string
--- @generic E : string
--- @class fsm.Event<S, E>
--- @field name E
--- @field from S | S[]
--- @field to S

--- @alias fsm.EventFn fun(self: fsm.Machine): boolean
--- @alias fsm.Callback<S, E> fun(self: fsm.Machine, event: E, from: S, to: S, msg?: string)

--- @generic S : string
--- @generic E : string
--- @class fsm.Definition<S, E>
--- @field initial? S
--- @field events fsm.Event<S, E>[]
--- @field callbacks? { [string]: fsm.Callback<S, E> }

--- @generic S : string
--- @generic E : string
--- @class fsm.Machine<S, E>
--- @field current S
--- @field currentTransitioningEvent E
--- @field [E] fsm.EventFn
local Machine = {}

--- @param S string
--- @return boolean
function Machine:is(state) end

--- @param event E
--- @return boolean
function Machine:can(event) end

--- @param event E
--- @return boolean
function Machine:cannot(event) end

--- @param event E
function Machine:transition(event) end

--- @param event E
function Machine:cancelTransition(event) end

--- @return string
function Machine:todot() end

--- @class fsm
local M = {}

--- @type fsm.AsyncState
M.NONE = "none"

--- @type fsm.AsyncState
M.ASYNC = "async"

--- @generic S : string
--- @generic E : string
--- @param options fsm.Definition<S, E>
--- @return fsm.Machine<S, E>
function M.create(def) end

return M

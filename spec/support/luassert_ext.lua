local assert = require("luassert.assert")
local match = require("luassert.match")
local namespace = require("luassert.namespaces")
local spy = require("luassert.spy")
local util = require("luassert.util")

local SELF_STATE_KEY = "__self_state"
local SPY_STATE_KEY = "payload"

--- @param state table
--- @param _ any
--- @param level integer?
local function mod_self(state, _, level)
  level = (level or 1) + 1

  if rawget(state, SELF_STATE_KEY) then
    error("'self' already set", level)
  end

  local payload = rawget(state, SPY_STATE_KEY)

  if not spy.is_spy(payload) then
    error("'self' must be chained after 'assert.spy(spy)'", level)
  end

  if payload.target_table == nil then
    error("'self' must be used with a 'spy.on()' spy", level)
  end

  rawset(state, SELF_STATE_KEY, true)
end

local called = namespace.assertion.called
local cb_called = called.callback
local called_with = namespace.assertion.called_with
local cb_called_with = called_with.callback

called_with.callback = function(state, arguments, level)
  if rawget(state, SELF_STATE_KEY) then
    local payload = rawget(state, SPY_STATE_KEY)

    util.tinsert(arguments, 1, match.is_ref(payload.target_table))
  end

  return cb_called_with(state, arguments, level)
end

called.callback = function(state, arguments, level, compare)
  if rawget(state, SELF_STATE_KEY) then
    return called_with.callback(state, {}, level)
  end

  return cb_called(state, arguments, level, compare)
end

assert:register("modifier", "self", mod_self)

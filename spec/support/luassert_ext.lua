local spy = require("luassert.spy")
local util = require("luassert.util")
local match = require("luassert.match")
local assert = require("luassert.assert")
local namespace = require("luassert.namespaces")

local SELF_STATE_KEY = "__self_state"
local SPY_STATE_KEY = "payload"

local function mod_self(state, arguments, level)
  local level = (level or 1) + 1

  if rawget(state, SELF_STATE_KEY) then
    error("'self' already set", level)
  end

  local payload = rawget(state, SPY_STATE_KEY)

  if not spy.is_spy(payload) then
    error("'self' must be chained after 'spy(aspy)'", level)
  end

  if payload.target_table == nil then
    error("'self' must be used with a 'spy.on' spy", level)
  end

  rawset(state, SELF_STATE_KEY, true)
end

local called_with = namespace.assertion.called_with
local called_with_callback = called_with.callback

called_with.callback = function(state, arguments, level)
  if rawget(state, SELF_STATE_KEY) then
    local payload = rawget(state, SPY_STATE_KEY)
    util.tinsert(arguments, 1, match.is_ref(payload.target_table))
  end

  return called_with_callback(state, arguments, level)
end

local called = namespace.assertion.called
local called_callback = called.callback

called.callback = function(state, arguments, level, compare)
  local expected_once = (arguments[1] or 1) == 1

  if rawget(state, SELF_STATE_KEY) and expected_once then
    return called_with.callback(state, arguments, level)
  end

  return called_callback(state, arguments, level, compare)
end

assert:register("modifier", "self", mod_self)

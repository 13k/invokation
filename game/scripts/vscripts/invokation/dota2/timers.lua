--- Timers framework.
--
-- Original code: [https://github.com/bmddota/barebones](https://github.com/bmddota/barebones)
--
-- @module invokation.dota2.timers
-- @author bmddota (original author)
-- @author 13k (updates)
-- @license Apache License 2.0
-- @copyright bmddota

local M = {_VERSION = "1.06"}

local THINK_NAME = "timers"
local THINK_INTERVAL = 0.01

--- Default error handler.
-- @tparam string msg Error message
-- @treturn string Error message and stack trace.
function M.defaultErrorHandler(msg)
  return msg .. "\n" .. debug.traceback() .. "\n"
end

local function generateUniqueName()
  return UniqueString("timer")
end

local function handleError(timer, err)
  print("[ERROR] Timer " .. timer.name .. ":")
  print(err)
end

local Timer = require("pl.class")()

function Timer:_init(options)
  self.name = options.name or generateUniqueName()
  self.callback = options.callback
  self.context = options.context
  self.realtime = options.realtime
  self.delay = options.delay or 0
  self.onError = options.onError or M.defaultErrorHandler
  self.paused = options.paused

  assert(self.callback, string.format("Invalid timer %q: no callback provided", self.name))

  self.at = self:now() + self.delay

  if self.context then
    self.callbackWrapper = function()
      return self.callback(self.context, self)
    end
  else
    self.callbackWrapper = function()
      return self.callback(self)
    end
  end
end

function Timer:now()
  return self.realtime and Time() or GameRules:GetGameTime()
end

--- Initializes timers.
--
-- Should be placed inside the `Activate()` function.
--
function M:Start()
  self.timers = {}
  -- local ent = SpawnEntityFromTableSynchronous("info_target", {targetname="timers_lua_thinker"})
  GameRules:GetGameModeEntity():SetThink("think", self, THINK_NAME, THINK_INTERVAL)
end

function M:think()
  for _, timer in pairs(self.timers) do
    self:processTimer(timer)
  end

  return THINK_INTERVAL
end

function M:processTimer(timer)
  if timer.paused then
    return
  end

  if timer.at > timer:now() then
    return
  end

  local removeTimer = true
  local success, result = xpcall(timer.callbackWrapper, timer.onError)

  if not success then
    handleError(timer, result)
  elseif type(result) == "number" then
    timer.at = timer.at + result
    removeTimer = false
  end

  if removeTimer then
    self.timers[timer.name] = nil
  end
end

--[[--
  Creates a timer with the given options.

  @usage
    -- immediately calls `obj.fn(obj, timer)` (equivalent to `obj:fn(timer)`),
    -- if `fn` returns a number, repeats at that interval
    Create({callback=obj.fn, context=obj})

    -- 10 seconds delayed, run once using game time (respect pauses)
    Create({
      at=10,
      callback=function()
        print("Hello. I'm running 10 seconds after when I was started.")
      end,
    })

    -- 10 second delayed, run once regardless of pauses
    Create({
      at=10,
      realtime=true,
      callback=function()
        print("Hello. I'm running 10 seconds after I was started even if someone paused the game.")
      end,
    })

    -- A timer running every second that starts 5 seconds in the future.
    -- Uses game time, respecting pauses.
    Create({
      delay=5.0,
      callback=function()
        print("Hello. I'm running 5 seconds after you called me and then every second thereafter.")
        return 1.0
      end,
    })

    -- A timer running every second that starts after 2 minutes regardless of pauses
    Create({
      name="uniqueTimerString3",
      delay=120,
      realtime=true,
      callback=function()
        print("Hello. I'm running after 2 minutes and then every second thereafter.")
        return 1
      end,
    })

  @tparam table options Options table
  @tparam function options.callback Timer function
  @tparam[opt] table options.context Context table to be passed to the callback
  @tparam[opt=0] number|nil options.delay Delay start time (seconds).
    `nil`, `0` or negative number means it starts immediately
  @tparam[opt=false] bool options.realtime If `true`, uses real clock (ignores pauses)
  @tparam[opt=nil] function options.onError Error handler function. If `nil`, uses @{defaultErrorHandler}
]]
function M:Create(options)
  local timer = Timer(options)

  assert(
    self.timers[timer.name] == nil,
    string.format("Invalid timer %q: timer already registered", timer.name)
  )

  self.timers[timer.name] = timer

  return timer.name
end

--[[
-- FIXME: deal with concurrency with Think()
function M:Pause(name)
  local timer = self.timers[name]

  if timer == nil then
    return nil
  end

  timer.paused = true
  return timer
end
]]
--[[
-- FIXME: deal with concurrency with Think()
function M:Cancel(name)
  local timer = self.timers[name]
  self.timers[name] = nil
  return timer
end
]]
--[[
-- FIXME: deal with concurrency with Think()
function M:CancelAll(removePersistent)
  if removePersistent then
    self.timers = {}
    return self
  end

  for _, timer in pairs(self.timers) do
    if not timer.persist then
      self.timers[timer.name] = nil
    end
  end

  return self
end
]]
return M

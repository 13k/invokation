--- Timers framework.
--
-- Original code: [https://github.com/bmddota/barebones](https://github.com/bmddota/barebones)
--
-- @module invokation.dota2.timers
-- @author bmddota (original author)
-- @author 13k (updates)
-- @license Apache License 2.0
-- @copyright bmddota

local M = { _VERSION = "1.06" }

local THINK_NAME = "timers"
local THINK_INTERVAL = 0.01

local ERRF_INVALID_TIMER_ID = "Invalid timer id: %s [%s]"
local ERRF_INVALID_TIMER_CALLBACK = "Invalid timer %q: callback must be a function"
local ERRF_INVALID_TIMER_ALREADY_REGISTERED = "Invalid timer %q: already registered"

--- Default error handler.
-- @tparam string msg Error message
-- @treturn string Error message and stack trace.
function M.defaultErrorHandler(msg)
  return msg .. "\n" .. debug.traceback() .. "\n"
end

local function generateUniqueId()
  return UniqueString("timer")
end

local function handleError(timer, err)
  print("[ERROR] Timer " .. timer.id .. ":")
  print(err)
end

local Timer = require("pl.class")()

function Timer:_init(options)
  self.id = options.id or generateUniqueId()
  self.callback = options.callback
  self.args = options.args or {}
  self.realtime = options.realtime
  self.delay = options.delay or 0
  self.onError = options.onError or M.defaultErrorHandler
  self.paused = options.paused
  self.at = (options.at or self:now()) + self.delay

  assert(type(self.id) == "string", ERRF_INVALID_TIMER_ID:format(self.id, type(self.id)))
  assert(type(self.callback) == "function", ERRF_INVALID_TIMER_CALLBACK:format(self.id))

  self.callbackWrapper = function()
    return self.callback(unpack(self.args))
  end
end

function Timer:now()
  return self.realtime and Time() or GameRules:GetGameTime()
end

--- Initializes timers.
--
-- Should be placed inside the custom game's `Activate` function.
--
-- @tparam[opt=0.01] float interval Timer processing interval
function M:Start(interval)
  self.interval = interval or THINK_INTERVAL
  self.timers = {}

  GameRules:GetGameModeEntity():SetThink("think", self, THINK_NAME, self.interval)
end

function M:think()
  for _, timer in pairs(self.timers) do
    self:processTimer(timer)
  end

  return self.interval
end

function M:processTimer(timer)
  if timer.paused then return end

  if timer.at > timer:now() then return end

  local removeTimer = true
  local success, result = xpcall(timer.callbackWrapper, timer.onError)

  if not success then
    handleError(timer, result)
  elseif type(result) == "number" then
    timer.at = timer.at + result
    removeTimer = false
  end

  if removeTimer then
    self.timers[timer.id] = nil
  end
end

--[[--
  Creates a timer with the given options.

  @usage
    -- Immediately calls `obj.fn(obj, 13)` (equivalent to `obj:fn(13)`),
    -- if `fn` returns a number, repeats at that interval
    Create({callback = obj.fn, args = {obj, 13}})

    -- 10 seconds delayed, run once using game time (respect pauses)
    Create({
      delay = 10.0,
      callback = function()
        print("Hello. I'm running 10 seconds after when I was started.")
      end
    })

    -- 10 second delayed, run once regardless of pauses
    Create({
      delay = 10.0,
      realtime = true,
      callback = function()
        print("Hello. I'm running 10 seconds after I was started even if someone paused the game.")
      end
    })

    -- At a specific time, run once using game time (respect pauses)
    Create({
      at = GameRules:GetGameTime() + 10.0,
      callback = function()
        print("Hello. I'm running when I was scheduled to run.")
      end
    })

    -- At a specific time, run once using real time (regardless of pauses)
    Create({
      at = Time() + 10.0,
      realtime = true,
      callback = function()
        print("Hello. I'm running when I was scheduled to run, even if someone paused the game.")
      end
    })

    -- At a specific time, 10 second delay from that time, run once using game time (respect pauses)
    Create({
      at = GameRules:GetGameTime() + 30.0,
      delay = 10.0,
      callback = function()
        print("Hello. I'm running 10 seconds after when I was scheduled to run.")
      end
    })

    -- A timer running every second that starts 5 seconds in the future.
    -- Uses game time, respecting pauses.
    Create({
      delay = 5.0,
      callback = function()
        print("Hello. I'm running 5 seconds after you called me and then every second thereafter.")
        return 1.0
      end
    })

    -- A timer running every second that starts after 2 minutes regardless of pauses
    Create({
      id = "uniqueTimerId",
      delay = 120.0,
      realtime = true,
      callback = function()
        print("Hello. I'm running after 2 minutes and then every second thereafter.")
        return 1.0
      end
    })

  @tparam table options Options table
  @tparam function options.callback Timer function
  @tparam[opt] string options.id Timer id
  @tparam[opt] list options.args List of arguments to pass to the callback
  @tparam[opt] number options.at Specific start time (timestamp in seconds).
  `nil`, `0` or negative number means it starts immediately
  @tparam[opt] number options.delay Delay start time (in seconds).
  `nil`, `0` or negative number means it starts immediately
  @tparam[opt=false] bool options.realtime If `true`, uses real clock (ignores pauses)
  @tparam[opt=false] bool options.paused If `true`, the timer starts paused and must be manually
  unpaused with @{Unpause}
  @tparam[opt=nil] function options.onError Error handler function. If `nil`, uses @{defaultErrorHandler}
]]
function M:Create(options)
  local timer = Timer(options)

  assert(self.timers[timer.id] == nil, ERRF_INVALID_TIMER_ALREADY_REGISTERED:format(timer.id))

  self.timers[timer.id] = timer

  return timer.id
end

function M:setPaused(id, value)
  local timer = self.timers[id]

  if timer == nil then
    return nil
  end

  timer.paused = value
  return id
end

--- Pauses a timer.
-- @tparam string id Timer id
-- @treturn ?string Id of paused timer or `nil` if the id isn't registered
function M:Pause(id)
  return self:setPaused(id, true)
end

--- Unpauses a timer.
-- @tparam string id Timer id
-- @treturn ?string Id of paused timer or `nil` if the id isn't registered
function M:Unpause(id)
  return self:setPaused(id, false)
end

--- Cancels a timer.
-- @tparam string id Timer id
-- @treturn ?string Id of canceled timer or `nil` if the id isn't registered
function M:Cancel(id)
  local timer = self.timers[id]
  self.timers[id] = nil
  return timer and id
end

--- Cancels all timers.
-- @treturn {string,...} Array of timer ids that were canceled
function M:CancelAll()
  local canceled = {}

  for id, _ in pairs(self.timers) do
    self.timers[id] = nil
    table.insert(canceled, id)
  end

  return canceled
end

return M

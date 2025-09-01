--- Timers framework.
---
--- Original code: [https://github.com/bmddota/barebones](https://github.com/bmddota/barebones)
---
--- @author bmddota (original author)
--- @author 13k (updates)
--- @license Apache License 2.0
--- @copyright bmddota

local class = require("middleclass")

local val = require("invk.lang.value")

--- @class invk.dota2.timers
--- @field timers { [string]: invk.dota2.Timer }
local M = { _VERSION = "1.06" }

local THINK_NAME = "timers"
local THINK_INTERVAL = 0.01

local ERRF_INVALID_TIMER_ID = "Invalid timer id: %s [%s]"
local ERRF_INVALID_TIMER_CALLBACK = "Invalid timer %q: callback must be a function"
local ERRF_INVALID_TIMER_ALREADY_REGISTERED = "Invalid timer %q: already registered"

--- Default error handler.
--- @param msg string # Error message
--- @return string # Error message and stack trace.
function M.default_error_handler(msg)
  return msg .. "\n" .. debug.traceback() .. "\n"
end

local function unique_id()
  return DoUniqueString("timer")
end

local function handle_error(timer, err)
  print("[ERROR] Timer " .. timer.id .. ":")
  print(err)
end

--- @class invk.dota2.Timer : middleclass.Class
--- @field id string
--- @field callback (fun(...): any...)
--- @field args any[]
--- @field realtime boolean
--- @field delay number
--- @field paused boolean
--- @field at number
--- @field onError (fun(err: string): string)
--- @field private callback_wrapper (fun(): any...)
local Timer = class("Timer")

--- @class invk.dota2.TimerOptions
--- @field callback (fun(...): any...) # Timer function
--- @field id? string # Timer id
--- @field args? any[] # List of arguments to pass to the callback
--- @field at? number # Specific start time (timestamp in seconds). `nil`, `0` or negative number means it starts immediately
--- @field delay? number # Delay start time (in seconds). `nil`, `0` or negative number means it starts immediately
--- @field realtime? boolean # If `true`, uses real clock (ignores pauses) (default: `false`)
--- @field paused? boolean # If `true`, the timer starts paused and must be manually unpaused with [Unpause] (default: `false`)
--- @field onError? fun(err: string): string # Error handler function. If `nil`, uses [default_error_handler] (default: `nil`)

--- @param options invk.dota2.TimerOptions
function Timer:initialize(options)
  self.id = options.id or unique_id()
  self.callback = options.callback
  self.args = options.args or {}
  self.realtime = val.non_nil(options.realtime, false)
  self.delay = options.delay or 0
  self.onError = options.onError or M.default_error_handler
  self.paused = val.non_nil(options.paused, false)
  self.at = (options.at or self:now()) + self.delay

  assertf(type(self.id) == "string", ERRF_INVALID_TIMER_ID, self.id, type(self.id))
  assertf(type(self.callback) == "function", ERRF_INVALID_TIMER_CALLBACK, self.id)

  self.callback_wrapper = function()
    return self.callback(unpack(self.args))
  end
end

--- @private
function Timer:now()
  return self.realtime and Time() or GameRules:GetGameTime()
end

--- @private
function M:think()
  for _, timer in pairs(self.timers) do
    self:process_timer(timer)
  end

  return self.interval
end

--- @private
function M:process_timer(timer)
  if timer.paused then
    return
  end

  if timer.at > timer:now() then
    return
  end

  local removeTimer = true
  local success, result = xpcall(timer.callbackWrapper, timer.onError)

  if not success then
    handle_error(timer, result)
  elseif type(result) == "number" then
    timer.at = timer.at + result
    removeTimer = false
  end

  if removeTimer then
    self.timers[timer.id] = nil
  end
end

--- Initializes timers.
---
--- Should be placed inside the custom game's `Activate` function.
---
--- @param interval? number # Timer processing interval (default: `0.01`)
function M:start(interval)
  self.interval = interval or THINK_INTERVAL
  self.timers = {}

  GameRules:GetGameModeEntity():SetThink("think", self, THINK_NAME, self.interval)
end

--- Creates a timer with the given options.
---
--- ```lua
--- -- Immediately calls `obj.fn(obj, 13)` (equivalent to `obj:fn(13)`),
--- -- if `fn` returns a number, repeats at that interval
--- Create({callback = obj.fn, args = {obj, 13}})
---
--- -- 10 seconds delayed, run once using game time (respect pauses)
--- Create({
---   delay = 10.0,
---   callback = function()
---     print("Hello. I'm running 10 seconds after when I was started.")
---   end
--- })
---
--- -- 10 second delayed, run once regardless of pauses
--- Create({
---   delay = 10.0,
---   realtime = true,
---   callback = function()
---     print("Hello. I'm running 10 seconds after I was started even if someone paused the game.")
---   end
--- })
---
--- -- At a specific time, run once using game time (respect pauses)
--- Create({
---   at = GameRules:GetGameTime() + 10.0,
---   callback = function()
---     print("Hello. I'm running when I was scheduled to run.")
---   end
--- })
---
--- -- At a specific time, run once using real time (regardless of pauses)
--- Create({
---   at = Time() + 10.0,
---   realtime = true,
---   callback = function()
---     print("Hello. I'm running when I was scheduled to run, even if someone paused the game.")
---   end
--- })
---
--- -- At a specific time, 10 second delay from that time, run once using game time (respect pauses)
--- Create({
---   at = GameRules:GetGameTime() + 30.0,
---   delay = 10.0,
---   callback = function()
---     print("Hello. I'm running 10 seconds after when I was scheduled to run.")
---   end
--- })
---
--- -- A timer running every second that starts 5 seconds in the future.
--- -- Uses game time, respecting pauses.
--- Create({
---   delay = 5.0,
---   callback = function()
---     print("Hello. I'm running 5 seconds after you called me and then every second thereafter.")
---     return 1.0
---   end
--- })
---
--- -- A timer running every second that starts after 2 minutes regardless of pauses
--- Create({
---   id = "uniqueTimerId",
---   delay = 120.0,
---   realtime = true,
---   callback = function()
---     print("Hello. I'm running after 2 minutes and then every second thereafter.")
---     return 1.0
---   end
--- })
--- ```
--- @param options invk.dota2.TimerOptions
--- @return string # Timer ID
function M:create(options)
  if options.id then
    assertf(self.timers[options.id] == nil, ERRF_INVALID_TIMER_ALREADY_REGISTERED, options.id)
  end

  local timer = Timer:new(options)

  self.timers[timer.id] = timer

  return timer.id
end

--- @private
--- @param id string
--- @param value boolean
--- @return string?
function M:set_paused(id, value)
  local timer = self.timers[id]

  if timer == nil then
    return nil
  end

  timer.paused = value

  return id
end

--- Pauses a timer.
--- @param id string # Timer id
--- @return string? # Id of paused timer or `nil` if the id isn't registered
function M:pause(id)
  return self:set_paused(id, true)
end

--- Unpauses a timer.
--- @param id string # Timer id
--- @return string? # Id of paused timer or `nil` if the id isn't registered
function M:unpause(id)
  return self:set_paused(id, false)
end

--- Cancels a timer.
--- @param id string # Timer id
--- @return string? # Id of canceled timer or `nil` if the id isn't registered
function M:cancel(id)
  local timer = self.timers[id]

  self.timers[id] = nil

  return timer and id
end

--- Cancels all timers.
--- @return string[] # Array of timer ids that were canceled
function M:cancel_all()
  local canceled = {}

  for id, _ in pairs(self.timers) do
    self.timers[id] = nil
    canceled[#canceled + 1] = id
  end

  return canceled
end

return M

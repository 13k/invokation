local class = require("middleclass")
local inspect = require("inspect")

--- Logger class.
--- @class invk.Logger : middleclass.Class, invk.log.LevelHelpers
--- @field name string
--- @field level invk.log.Level
--- @field format string
local M = class("invk.Logger")

--- @enum invk.log.Level
M.Level = {
  --- Debug
  DEBUG = 10,
  --- Info
  INFO = 20,
  --- Warning
  WARNING = 30,
  --- Error
  ERROR = 40,
  --- Critical
  CRITICAL = 50,
}

--- Level names
--- @type { [invk.log.Level]: string }
M.LevelName = {
  [M.Level.DEBUG] = "debug",
  [M.Level.INFO] = "info",
  [M.Level.WARNING] = "warning",
  [M.Level.ERROR] = "error",
  [M.Level.CRITICAL] = "critical",
}

--- Default level. (`INFO`)
M.DEFAULT_LEVEL = M.Level.INFO
--- Default format. (`"{timestamp} ({severity}) [{name}] {message}"`)
M.DEFAULT_FORMAT = "{timestamp} ({severity}) [{name}] {message}"

--- @param i integer
--- @param value any
--- @return string
local function format_value(i, value)
  -- Treat first string argument as the title text for the log message and
  -- return it as is. All other strings are serialized.
  if i == 1 and type(value) == "string" then
    return value
  end

  return inspect(value)
end

--- Constructor.
--- @param name (string | string[]) Log name
--- @param level? integer One of the logger levels (default: [DEFAULT_LEVEL])
--- @param format? string Log entry format (default: [DEFAULT_FORMAT])
function M:initialize(name, level, format)
  self.level = level or M.DEFAULT_LEVEL
  self.format = format or M.DEFAULT_FORMAT

  if type(name) == "table" then
    name = table.concat(name, ".")
  end

  self.name = name
end

--- Creates a new Logger instance that inherits from the current instance.
--- @param name string Child log name
--- @return invk.Logger Child instance
function M:child(name)
  return M:new({ self.name, name }, self.level, self.format)
end

--- Logs a message if the current logger level is lower than the given level.
---
--- It generates all log entry components (timestamp, severity, ame and message)
--- and replaces in the message template format.
---
--- Components:
---
--- * `timestamp`: current date and time
--- * `severity`: logger level name
--- * `name`: name given in constructor
--- * `message`: serializes all vararg values in a pretty format and joins them
---   with a single space
--- @param level invk.log.Level # One of the logger levels
--- @param ... any # Values
function M:log(level, ...)
  if level < self.level then
    return
  end

  --- @type string[]
  local formatted = {}

  -- Explicitly iterate with actual arguments array size to correctly print `nil`
  -- values at the end of the array which are ignored in `{...}`
  for i = 1, select("#", ...) do
    local value = select(i, ...)

    table.insert(formatted, format_value(i, value))
  end

  local values = {
    ["{timestamp}"] = GetSystemDate() .. " " .. GetSystemTime(),
    ["{severity}"] = M.LevelName[level],
    ["{name}"] = self.name,
    ["{message}"] = table.concat(formatted, " "),
  }

  local message = self.format:gsub("%b{}", values)

  print(message)
end

--- Logs a formatted message if the current logger level is lower than the given level.
--- @param level invk.log.Level # One of the logger levels
--- @param fmt string # Format string
--- @param ... any # Values
function M:logf(level, fmt, ...)
  if level < self.level then
    return
  end

  return self:log(level, F(fmt, ...))
end

--- @class invk.log.LogApi
--- @field log fun(self: self, level: invk.log.Level, ...: any)
--- @field logf fun(self: self, level: invk.log.Level, fmt: string, ...: any)

--- @class invk.log.LevelHelpers : invk.log.LogApi
--- Logs a message with DEBUG level
--- @field debug fun(self: self, ...: any)
--- Logs a formatted message with DEBUG level
--- @field debugf fun(self: self, fmt: string, ...: any)
--- Logs a message with INFO level
--- @field info fun(self: self, ...: any)
--- Logs a formatted message with INFO level
--- @field infof fun(self: self, fmt: string, ...: any)
--- Logs a message with WARNING level
--- @field warning fun(self: self, ...: any)
--- Logs a formatted message with WARNING level
--- @field warningf fun(self: self, fmt: string, ...: any)
--- Logs a message with ERROR level
--- @field error fun(self: self, ...: any)
--- Logs a formatted message with ERROR level
--- @field errorf fun(self: self, fmt: string, ...: any)
--- Logs a message with CRITICAL level
--- @field critical fun(self: self, ...: any)
--- Logs a formatted message with CRITICAL level
--- @field criticalf fun(self: self, fmt: string, ...: any)

--- @param mod invk.log.LogApi
local function create_level_methods(mod)
  for _, level in pairs(M.Level) do
    local name = M.LevelName[level]
    local fn_name = name
    local fn_name_f = name .. "f"

    -- function M:debug(...) ... end
    --- @param self invk.log.LogApi
    --- @param ... any
    mod[fn_name] = function(self, ...)
      self:log(level, ...)
    end

    -- function M:debugf(...) ... end
    --- @param self invk.log.LogApi
    --- @param fmt string
    --- @param ... any
    mod[fn_name_f] = function(self, fmt, ...)
      self:logf(level, fmt, ...)
    end
  end
end

create_level_methods(M)

--- Helpers Mixin.
--- Requires a `self.logger` [invk.Logger] field.
--- @class invk.log.Mixin : { logger: invk.Logger? }, invk.log.LevelHelpers
M.Mixin = {}

--- @param level invk.log.Level # One of the logger levels
--- @param ... any # Values
function M.Mixin:log(level, ...)
  if not self.logger then
    return
  end

  self.logger:log(level, ...)
end

--- @param level invk.log.Level # One of the logger levels
--- @param fmt string # Format string
--- @param ... any # Values
function M.Mixin:logf(level, fmt, ...)
  if not self.logger then
    return
  end

  self.logger:logf(level, fmt, ...)
end

--- Shortcut for [invk.Logger:debug]
--- @param ... any
function M.Mixin:d(...)
  if not self.logger then
    return
  end

  self.logger:debug(...)
end

--- Shortcut for [invk.Logger:warningf]
--- @param fmt string
--- @param ... any
function M.Mixin:warnf(fmt, ...)
  if not self.logger then
    return
  end

  self.logger:warningf(fmt, ...)
end

create_level_methods(M.Mixin)

return M

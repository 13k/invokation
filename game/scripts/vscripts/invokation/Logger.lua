--- Logger class.
-- @classmod invokation.Logger

local pp = require("pl.pretty")
local text = require("pl.text")
local tablex = require("pl.tablex")
local stringx = require("pl.stringx")

local M = require("pl.class")()

--- Logger Levels
-- @section levels

--- Unknown (outputs everything)
-- @field[type=int] UNKNOWN
M.UNKNOWN = 0
--- Debug
-- @field[type=int] DEBUG
M.DEBUG = 10
--- Info
-- @field[type=int] INFO
M.INFO = 20
--- Warning
-- @field[type=int] WARNING
M.WARNING = 30
--- Error
-- @field[type=int] ERROR
M.ERROR = 40
--- Critical
-- @field[type=int] CRITICAL
M.CRITICAL = 50

--- Level names
-- @table LEVEL_NAMES
-- @field[type=string] UNKNOWN UNKNOWN
-- @field[type=string] DEBUG DEBUG
-- @field[type=string] INFO INFO
-- @field[type=string] WARNING WARNING
-- @field[type=string] ERROR ERROR
-- @field[type=string] CRITICAL CRITICAL
M.LEVEL_NAMES = {
  [M.UNKNOWN] = "UNKNOWN",
  [M.DEBUG] = "DEBUG",
  [M.INFO] = "INFO",
  [M.WARNING] = "WARNING",
  [M.ERROR] = "ERROR",
  [M.CRITICAL] = "CRITICAL"
}

--- Defaults
-- @section defaults

--- Default level. (`INFO`)
M.DEFAULT_LEVEL = M.INFO
--- Default format. (`"$timestamp ($severity) [$progname] $message"`)
M.DEFAULT_FORMAT = "$timestamp ($severity) [$progname] $message"

local function formatValue(i, value)
  -- Treat first string argument as the title text for the log message and
  -- return it as is. All other strings are serialized.
  if i == 1 and type(value) == "string" then
    return value
  end

  -- ignore multi-value return
  local serialized = pp.write(value)

  return serialized
end

--- Methods
-- @section methods

--- Constructor.
-- @tparam string|array(string) progname Program name
-- @tparam[opt=DEFAULT_LEVEL] int level One of the logger levels
-- @tparam[opt=DEFAULT_FORMAT] string format Log entry format
function M:_init(progname, level, format)
  self.level = level or M.DEFAULT_LEVEL
  self.format = format or M.DEFAULT_FORMAT
  self.template = text.Template(self.format)

  if type(progname) == "table" then
    progname = stringx.join(".", progname)
  end

  self.progname = progname
end

function M:Child(progname)
  return M({self.progname, progname}, self.level, self.format)
end

--- Logs a message if the current logger level is lower than the given level.
--
-- It generates all log entry components (timestamp, severity, progname and
-- message) and replaces in the message template format.
--
-- Components:
--
-- * `timestamp`: current date and time
-- * `severity`: logger level name (@{LEVEL_NAMES})
-- * `progname`: progname given in constructor
-- * `message`: serializes all vararg values in a pretty format and joins them
--   with a single space
-- @tparam int level One of the logger levels
-- @param[opt] ... Values
function M:Log(level, ...)
  if level < self.level then
    return
  end

  local values = {...}
  local formatted = {}

  -- Explicitly iterate with actual arguments list size to correctly print `nil`
  -- values at the end of the list which are ignored in `{...}`
  for i = 1, select("#", ...) do
    table.insert(formatted, formatValue(i, values[i]))
  end

  local tmplValues = {
    timestamp = GetSystemDate() .. " " .. GetSystemTime(),
    severity = M.LEVEL_NAMES[level],
    progname = self.progname,
    message = stringx.join(" ", formatted)
  }

  return print(self.template:substitute(tmplValues))
end

--- Logs a formatted message if the current logger level is lower than the
-- given level.
-- @tparam int level One of the logger levels
-- @tparam string format Format string
-- @param[opt] ... Values
function M:Logf(level, format, ...)
  if level < self.level then
    return
  end

  return self:Log(level, format:format(...))
end

--- Logs a message with DEBUG level
-- @function M:Debug
-- @param[opt] ... Values

--- Logs a formatted message with DEBUG level
-- @function M:Debugf
-- @tparam string format Format string
-- @param[opt] ... Values

--- Logs a message with INFO level
-- @function M:Info
-- @param[opt] ... Values

--- Logs a formatted message with INFO level
-- @function M:Infof
-- @tparam string format Format string
-- @param[opt] ... Values

--- Logs a message with WARNING level
-- @function M:Warning
-- @param[opt] ... Values

--- Logs a formatted message with WARNING level
-- @function M:Warningf
-- @tparam string format Format string
-- @param[opt] ... Values

--- Logs a message with ERROR level
-- @function M:Error
-- @param[opt] ... Values

--- Logs a formatted message with ERROR level
-- @function M:Errorf
-- @tparam string format Format string
-- @param[opt] ... Values

--- Logs a message with CRITICAL level
-- @function M:Critical
-- @param[opt] ... Values

--- Logs a formatted message with CRITICAL level
-- @function M:Criticalf
-- @tparam string format Format string
-- @param[opt] ... Values

local function createLevelMethods(levelName)
  if levelName == "UNKNOWN" then
    return
  end

  local title = stringx.title(levelName)

  -- function M:Debug(...) ... end
  M[title] = function(self, ...)
    return self:Log(self[levelName], ...)
  end

  -- function M:Debugf(...) ... end
  M[title .. "f"] = function(self, ...)
    return self:Logf(self[levelName], ...)
  end
end

for _, levelName in pairs(M.LEVEL_NAMES) do
  createLevelMethods(levelName)
end

--- HelpersMixin
-- @section helpers_mixin

--- Mixes @{HelpersMixin} into a class.
-- @function invokation.Logger.InstallHelpers
-- @tparam table cls Target class
function M.InstallHelpers(cls)
  tablex.update(cls, M.HelpersMixin)
end

--- Helpers Mixin.
-- Assumes `self.logger` instance attribute holds a `Logger` instance.
M.HelpersMixin = {}

--- Shortcut for `Logger.Debug`
-- @function invokation.Logger.HelpersMixin:d
function M.HelpersMixin:d(...)
  return self.logger:Debug(...)
end

--- Shortcut for `Logger.Debugf`
-- @function invokation.Logger.HelpersMixin:debugf
function M.HelpersMixin:debugf(...)
  return self.logger:Debugf(...)
end

--- Shortcut for `Logger.Warning`
-- @function invokation.Logger.HelpersMixin:warn
function M.HelpersMixin:warn(...)
  return self.logger:Warning(...)
end

--- Shortcut for `Logger.Warningf`
-- @function invokation.Logger.HelpersMixin:warnf
function M.HelpersMixin:warnf(...)
  return self.logger:Warningf(...)
end

--- Shortcut for `Logger.Error`
-- @function invokation.Logger.HelpersMixin:err
function M.HelpersMixin:err(...)
  return self.logger:Error(...)
end

--- Shortcut for `Logger.Errorf`
-- @function invokation.Logger.HelpersMixin:errf
function M.HelpersMixin:errf(...)
  return self.logger:Errorf(...)
end

return M

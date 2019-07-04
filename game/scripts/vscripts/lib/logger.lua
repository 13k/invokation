local M = require("pl.class")()

local pretty = require("pl.pretty")
local stringx = require("pl.stringx")
local tablex = require("pl.tablex")
local text = require("pl.text")

local LEVEL = {
  UNKNOWN = 0,
  DEBUG = 10,
  INFO = 20,
  WARNING = 30,
  ERROR = 40,
  CRITICAL = 50
}

local LEVEL_NAMES = tablex.index_map(LEVEL)

M.DEFAULT_LEVEL = LEVEL.INFO
M.DEFAULT_FORMAT = text.Template("$timestamp ($severity) $progname: $message")

function M:_init(level, progname, format)
  self.level = level or M.DEFAULT_LEVEL
  self.progname = progname and (progname .. " ") or ""
  self.format = format and text.Template(format) or M.DEFAULT_FORMAT
end

function M:Log(level, ...)
  if level < self.level then
    return
  end

  local values =
    tablex.imap(
    function(v)
      return type(v) == "table" and pretty.write(v) or tostring(v)
    end,
    {...}
  )

  local keymap = {
    timestamp = GetSystemDate() .. " " .. GetSystemTime(),
    severity = LEVEL_NAMES[level],
    progname = self.progname,
    message = stringx.join(" ", values)
  }

  print(self.format:substitute(keymap))
end

function M:Debug(...)
  self:Log(LEVEL.DEBUG, ...)
end

function M:Info(...)
  self:Log(LEVEL.INFO, ...)
end

function M:Warning(...)
  self:Log(LEVEL.WARNING, ...)
end

function M:Error(...)
  self:Log(LEVEL.ERROR, ...)
end

function M:Critical(...)
  self:Log(LEVEL.CRITICAL, ...)
end

tablex.update(M, LEVEL)

return M

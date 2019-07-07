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

  local values = tablex.imap(pretty.write, {...})

  local keymap = {
    timestamp = GetSystemDate() .. " " .. GetSystemTime(),
    severity = LEVEL_NAMES[level],
    progname = self.progname,
    message = stringx.join(" ", values)
  }

  return print(self.format:substitute(keymap))
end

function M:Logf(level, format, ...)
  if level < self.level then
    return
  end

  return self:Log(level, format:format(...))
end

local function createLevelMethods(levelName)
  if levelName == "UNKNOWN" then
    return
  end

  local title = stringx.title(levelName)

  -- function M:Debug(...) ... end
  M[title] = function(self, ...)
    return self:Log(LEVEL[levelName], ...)
  end

  -- function M:Debugf(...) ... end
  M[title .. "f"] = function(self, ...)
    return self:Logf(LEVEL[levelName], ...)
  end
end

for level, _ in pairs(LEVEL) do
  createLevelMethods(level)
end

tablex.update(M, LEVEL)

return M

local M = require("pl.class")()

local pp = require("pl.pretty")
local sx = require("pl.stringx")
local tx = require("pl.tablex")
local tt = require("pl.text")

local LEVEL = {
  UNKNOWN = 0,
  DEBUG = 10,
  INFO = 20,
  WARNING = 30,
  ERROR = 40,
  CRITICAL = 50
}

local LEVEL_NAMES = tx.index_map(LEVEL)

M.DEFAULT_LEVEL = LEVEL.INFO
M.DEFAULT_FORMAT = tt.Template("$timestamp ($severity) $progname: $message")

function M:_init(level, progname, format)
  self.level = level or M.DEFAULT_LEVEL
  self.progname = progname and (progname .. " ") or ""
  self.format = format and tt.Template(format) or M.DEFAULT_FORMAT
end

function M:Log(level, ...)
  if level < self.level then
    return
  end

  local len = select("#", ...)
  local values = {...}
  local formatted = {}

  for i = 1, len do
    local s = pp.write(values[i])
    table.insert(formatted, s)
  end

  local keymap = {
    timestamp = GetSystemDate() .. " " .. GetSystemTime(),
    severity = LEVEL_NAMES[level],
    progname = self.progname,
    message = sx.join(" ", formatted)
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

  local title = sx.title(levelName)

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

tx.update(M, LEVEL)

return M

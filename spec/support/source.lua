local path = require("pl.path")

local M = {}

function M.file()
  return path.abspath(debug.getinfo(2, "S").source:match("@?([^[=].+)"))
end

function M.dir()
  return path.dirname(M.file())
end

return M

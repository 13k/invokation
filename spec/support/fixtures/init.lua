local file = require("pl.file")
local path = require("pl.path")

local source = require("support.source")

local M = {}

local ROOT_PATH = path.abspath(path.join(source.dir(), "..", ".."))
local SPEC_PATH = path.join(ROOT_PATH, "spec")
local FIXTURES_PATH = path.join(SPEC_PATH, "support", "fixtures")

function M.path(...)
  return path.join(FIXTURES_PATH, ...)
end

function M.read(...)
  return file.read(M.path(...))
end

function M.require(filename)
  filename = filename:gsub("%.", "_")

  local packagePath = M.path(filename)
  local package = path.relpath(packagePath, SPEC_PATH):gsub("/", ".")

  return require(package)
end

return M

local assert = require("luassert")
local class = require("middleclass")
local spy = require("luassert.spy")
local stub = require("luassert.stub")

--- @alias T.mock.Factory fun(mock: T.Mock): luassert.spy
--- @alias T.mock.Factories { [string]: T.mock.Factory }

--- @class T.Mock : middleclass.Class
--- @field private _spies { [string]: { [string]: luassert.spy } }
--- @field private _factories T.mock.Factories
--- @overload fun(factories?: T.mock.Factories): T.Mock
local M = class("T.Mock")

--- @param factories? T.mock.Factories
function M:initialize(factories)
  self._spies = {}
  self._factories = factories or {}
end

--- @param name string
function M:setup(name)
  self._factories[name](self)
end

--- @param name string
--- @param t table
--- @param key string
--- @param ... any
function M:stub(name, t, key, ...)
  self._spies[name] = self._spies[name] or {}
  self._spies[name][key] = stub.new(t, key, ...)
end

--- @private
--- @param name string
--- @param t table
--- @param key string
function M:_spy(name, t, key)
  self._spies[name] = self._spies[name] or {}
  self._spies[name][key] = spy.on(t, key)
end

--- @param name string
--- @param t table
--- @param key string | string[]
function M:spy(name, t, key)
  if type(key) == "table" then
    for _, k in ipairs(key) do
      self:_spy(name, t, k)
    end
  else
    self:_spy(name, t, key)
  end
end

--- @param name string
--- @param key string
--- @return T.spy.assert
function M:assert(name, key)
  return assert.spy(self._spies[name][key])
end

--- @private
--- @param name string
--- @param key string
function M:_clear(name, key)
  self._spies[name][key]:clear()
end

--- @param name string
--- @param ... string
function M:clear(name, ...)
  if select("#", ...) == 0 then
    for key, _ in pairs(self._spies[name]) do
      self:_clear(name, key)
    end
  else
    for _, key in ipairs({ ... }) do
      self:_clear(name, key)
    end
  end
end

--- @private
--- @param name string
--- @param key string
function M:_revert(name, key)
  self._spies[name][key]:revert()
end

--- @param name string
--- @param ... string
function M:revert(name, ...)
  if select("#", ...) == 0 then
    for key, _ in pairs(self._spies[name]) do
      self:_revert(name, key)
    end
  else
    for _, key in ipairs({ ... }) do
      self:_revert(name, key)
    end
  end
end

--- @param name? string
--- @param ... string
function M:reset(name, ...)
  if name then
    self:clear(name, ...)
    self:revert(name, ...)

    self._spies[name] = {}
  else
    for n, _ in pairs(self._spies) do
      self:clear(n)
      self:revert(n)
    end

    self._spies = {}
  end
end

return M

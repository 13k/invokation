local assert = require("luassert")
local class = require("pl.class")
local spy = require("luassert.spy")
local stub = require("luassert.stub")

--- @alias support.mock.Factory fun(mock: support.Mock): luassert.spy
--- @alias support.mock.Factories { [string]: support.mock.Factory }

--- @class support.Mock
--- @field private _spies { [string]: { [string]: luassert.spy } }
--- @field private _factories support.mock.Factories
--- @overload fun(factories?: support.mock.Factories): support.Mock
local Mock = class()

--- @param factories? support.mock.Factories
function Mock:_init(factories)
  self._spies = {}
  self._factories = factories or {}
end

--- @param name string
function Mock:setup(name)
  self._factories[name](self)
end

--- @param name string
--- @param t table
--- @param key string
--- @param ... any
function Mock:stub(name, t, key, ...)
  self._spies[name] = self._spies[name] or {}
  self._spies[name][key] = stub.new(t, key, ...)
end

--- @private
--- @param name string
--- @param t table
--- @param key string
function Mock:_spy(name, t, key)
  self._spies[name] = self._spies[name] or {}
  self._spies[name][key] = spy.on(t, key)
end

--- @param name string
--- @param t table
--- @param key string | string[]
function Mock:spy(name, t, key)
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
--- @return luassert.spy.assert
function Mock:assert(name, key)
  return assert.spy(self._spies[name][key])
end

--- @private
--- @param name string
--- @param key string
function Mock:_clear(name, key)
  self._spies[name][key]:clear()
end

--- @param name string
--- @param ... string
function Mock:clear(name, ...)
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
function Mock:_revert(name, key)
  self._spies[name][key]:revert()
end

--- @param name string
--- @param ... string
function Mock:revert(name, ...)
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
function Mock:reset(name, ...)
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

return Mock

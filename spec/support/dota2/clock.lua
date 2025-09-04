local assert = require("luassert")
local class = require("pl.class")
local spy = require("luassert.spy")

--- @class support.dota2.MockClock
--- @field tick integer
--- @field paused boolean
--- @field spy luassert.spy
local M = class()

--- @param tick? integer
--- @param paused? boolean
function M:_init(tick, paused)
  self.tick = tick or 0
  self.paused = paused == nil and false or paused
  self.spy = spy.on(self, "__call")
end

--- @return integer
function M:__call()
  if not self.paused then
    self.tick = self.tick + 1
  end

  return self.tick
end

function M:pause()
  self.paused = true
end

function M:unpause()
  self.paused = false
end

function M:reset()
  self.tick = 0
  self.spy:clear()
end

--- @return luassert.spy.assert
function M:assert()
  return assert.spy(self.spy)
end

return M

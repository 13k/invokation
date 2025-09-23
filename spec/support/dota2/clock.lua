local assert = require("luassert")
local class = require("middleclass")
local spy = require("luassert.spy")

--- @class T.dota2.MockClock : middleclass.Class
--- @field tick integer
--- @field paused boolean
--- @field spy luassert.spy
local M = class("T.dota2.MockClock")

--- @param tick? integer
--- @param paused? boolean
function M:initialize(tick, paused)
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

--- @return T.spy.assert
function M:assert()
  return assert.spy(self.spy)
end

return M

--- Env class.
-- @classmod invokation.game_mode.Env

local class = require("pl.class")

local M = class()

--- Environment modes
-- @section modes

--- Development
-- @tfield string DEVELOPMENT
M.DEVELOPMENT = "development"

--- Production
-- @tfield string PRODUCTION
M.PRODUCTION = "production"

--- Methods
-- @section methods

--- Constructor.
-- @tparam[opt=PRODUCTION] string name Environment name.
function M:_init(name)
  self.name = name or M.PRODUCTION
  self.development = self.name == M.DEVELOPMENT
  self.production = self.name == M.PRODUCTION
end

return M
--- Env class.
-- @classmod invokation.game_mode.Env

local M = require("pl.class")()

--- Environment modes
-- @section modes

--- Development
-- @field[type=string] DEVELOPMENT
M.DEVELOPMENT = "development"

--- Production
-- @field[type=string] PRODUCTION
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
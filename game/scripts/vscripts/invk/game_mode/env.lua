local val = require("invk.lang.value")

--- Environment
--- @enum invk.Env
local M = {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

--- @return boolean
function M.is_dev_mode()
  return IsInToolsMode() or GameRules:IsDev() or val.non_nil(Convars:GetBool("developer"), false)
end

return M

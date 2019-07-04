local M = require("pl.class")()

function M:_init(name)
  self.name = name
end

function M:Set(key, value)
  CustomNetTables:SetTableValue(self.name, key, value)
end

function M:Get(key, defaultValue)
  local value = CustomNetTables:GetTableValue(self.name, key)

  if value == nil then
    return defaultValue
  end

  return value
end

return M

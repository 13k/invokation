--- ItemsKeyValues class.
-- @classmod invokation.dota2.kv.ItemsKeyValues

local M = require("pl.class")()

local ItemKeyValues = require("invokation.dota2.kv.ItemKeyValues")

local ITEMS_FILE = "scripts/npc/items.txt"
local ITEM_KEY_PATT = "^item_"

--- Constructor.
function M:_init()
  self.kv = {}
  self:loadKV()
end

function M:loadKV()
  local items = LoadKeyValues(ITEMS_FILE)

  for name, kv in pairs(items) do
    if name:match(ITEM_KEY_PATT) and type(kv) == "table" then
      self.kv[name] = ItemKeyValues(name, kv)
    end
  end
end

function M:Entries()
  return pairs(self.kv)
end

return M
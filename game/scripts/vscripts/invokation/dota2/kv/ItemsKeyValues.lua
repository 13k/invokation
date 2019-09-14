--- ItemsKeyValues class.
-- @classmod invokation.dota2.kv.ItemsKeyValues

local M = require("pl.class")()

local ItemKeyValues = require("invokation.dota2.kv.ItemKeyValues")

local ITEMS_FILE = "scripts/npc/items.txt"
local ITEM_KEY_PATT = "^item_"

--- Constructor.
--
-- Reads all entries in `scripts/npc/items.txt` and convert each valid item
-- entry into `ItemKeyValues` instances.
--
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

--- Returns an iterator function that iterates over the `ItemKeyValues` entries.
-- @treturn function
function M:Entries()
  return pairs(self.kv)
end

return M

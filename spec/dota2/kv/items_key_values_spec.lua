local assert = require("luassert")

local ItemKeyValues = require("invk.dota2.kv.item_key_values")
local ItemsKeyValues = require("invk.dota2.kv.items_key_values")

describe("invk.dota2.kv.ItemsKeyValues", function()
  local item_blink_kv = { foo = "bar", ItemShopTags = "mobility;dagger" }
  local item_mango_kv = { foo = "qux", ItemShopTags = "consumable;delicious" }
  local item_potion_kv = { foo = "fox", ItemShopTags = "consumable;health" }

  describe("constructor", function()
    it("filters item keys", function()
      local subject = ItemsKeyValues:new({
        ["item_blink"] = item_blink_kv,
        ["non_item"] = { foo = "baz" },
        ["item_mango"] = item_mango_kv,
      })

      local expected = {
        ["item_blink"] = ItemKeyValues:new("item_blink", item_blink_kv),
        ["item_mango"] = ItemKeyValues:new("item_mango", item_mango_kv),
      }

      assert.same(expected, subject.data)
    end)
  end)

  describe(":search", function()
    it("filters items matching the given query", function()
      local subject = ItemsKeyValues:new({
        ["item_blink"] = item_blink_kv,
        ["item_mango"] = item_mango_kv,
        ["item_potion"] = item_potion_kv,
        ["non_item"] = { foo = "baz" },
      })

      local expected = {}

      assert.same(expected, subject:search("non-match"))

      -- match by name

      expected = {
        ["item_mango"] = item_mango_kv,
      }

      assert.same(expected, subject:search("mango"))

      -- match by shop tag

      expected = {
        ["item_mango"] = item_mango_kv,
        ["item_potion"] = item_potion_kv,
      }

      assert.same(expected, subject:search("consumable"))
    end)
  end)
end)

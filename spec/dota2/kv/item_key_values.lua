local assert = require("luassert")

local ItemKeyValues = require("invk.dota2.kv.item_key_values")

describe("invk.dota2.kv.ItemKeyValues", function()
  describe("constructor", function()
    it("sets attributes", function()
      local subject = ItemKeyValues:new("item_empty", {
        foo = "bar",
      })

      assert.equal("item_empty", subject.name)
      assert.same({}, subject.shop_tags)

      subject = ItemKeyValues:new("item_mango", {
        foo = "baz",
        ItemShopTags = "consumable;delicious",
      })

      assert.equal("item_mango", subject.name)
      assert.same({ "consumable", "delicious" }, subject.shop_tags)
    end)
  end)

  describe(":matches_query", function()
    it("checks if its attributes match the given query", function()
      local subject = ItemKeyValues:new("item_mango", {
        foo = "baz",
        ItemShopTags = "consumable;delicious",
      })

      assert.is_false(subject:matches_query("non-match"))
      assert.is_true(subject:matches_query("mango"))
      assert.is_true(subject:matches_query("consumable"))
      assert.is_true(subject:matches_query("delicious"))
    end)
  end)
end)

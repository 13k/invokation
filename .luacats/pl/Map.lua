local class = require("pl.class")

---@meta
---# Class [`pl.Map`](https://lunarmodules.github.io/Penlight/classes/pl.Map.html)
---
---A Map class.
---
---```lua
---> Map = require 'pl.Map'
---> m = Map{one=1,two=2}
---> m:update {three=3,four=4,two=20}
---> = m == M{one=1,two=20,three=3,four=4}
---true
---```
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [`pl.class`](https://lunarmodules.github.io/Penlight/libraries/pl.class.html#),
--- [`pl.tablex`](https://lunarmodules.github.io/Penlight/libraries/pl.tablex.html#),
--- [`pl.pretty`](https://lunarmodules.github.io/Penlight/libraries/pl.pretty.html#)
---@class pl.Map : pl.Class
---@overload fun(t?: pl.Map|pl.Set): pl.Map
local Map = class()

---list of keys.
---@param self pl.Map
---@return any[]
---@nodiscard
function Map:keys() end

---list of values.
---@param self pl.Map
---@return any[]
---@nodiscard
function Map:values() end

---return an iterator over all key-value pairs.
---@param self pl.Map
---@return fun(): (any, any)
---@nodiscard
function Map:iter() end

---return a List of all key-value pairs, sorted by the keys.
---@param self pl.Map
---@return pl.List
---@nodiscard
function Map:items() end

---set a value in the map if it doesn't exist yet.
---@param self pl.Map
---@param key any -- the key
---@param default any -- value to set
---@return any -- the value stored in the map (existing value, or the new value)
function Map:setdefault(key, default) end

---size of map. note: this is a relatively expensive operation!
---@param self pl.Map
---@return integer
---@nodiscard
function Map:len() end

---put a value into the map. This will remove the key if the value is nil
---@param self pl.Map
---@param key any -- the key
---@param val any -- the value
function Map:set(key, val) end

---get a value from the map.
---@param self pl.Map
---@param key any -- the key
---@return any val -- the value, or `nil` if not found.
---@nodiscard
function Map:get(key) end

---get a list of values indexed by a list of keys.
---@param self pl.Map
---@param keys pl.List -- a list-like table of keys
---@return pl.List values -- a new list
---@nodiscard
function Map:getvalues(keys) end

---update the map using key/value pairs from another table.
---@param self pl.Map
---@param table pl.Map|table
function Map:update(table) end

---equality between maps.
---@param self pl.Map
---@param m pl.Map -- another map.
---@return boolean
---@nodiscard
function Map:__eq(m) end

---string representation of a map.
---@param self pl.Map
---@return string
---@nodiscard
function Map:__tostring() end

return Map

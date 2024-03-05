---@meta

local class = require("pl.class")

---# Class [`pl.OrderedMap`](https://lunarmodules.github.io/Penlight/classes/pl.OrderedMap.html)
---
---`OrderedMap`, a `Map` which preserves ordering.
---
---Derived from [`pl.Map`](https://lunarmodules.github.io/Penlight/classes/pl.Map.html#).
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [`pl.tablex`](https://lunarmodules.github.io/Penlight/libraries/pl.tablex.html#),
--- [`pl.class`](https://lunarmodules.github.io/Penlight/libraries/pl.class.html#),
--- [`pl.List`](https://lunarmodules.github.io/Penlight/classes/pl.List.html#),
--- [`pl.Map`](https://lunarmodules.github.io/Penlight/classes/pl.Map.html#)
---@class pl.OrderedMap : pl.Map
---@overload fun(t?: {[any]: any}|{[any]: any}[]|pl.OrderedMap): pl.OrderedMap
local OrderedMap = class()

---construct an `OrderedMap`. Will throw an error if the argument is bad.
---@param self pl.OrderedMap
---@param t? {[any]: any}|{[any]: any}[]|pl.OrderedMap -- optional initialization table, same as for `OrderedMap:update`
function OrderedMap:_init(t) end

---update an `OrderedMap` using a table. If the table is itself an
---`OrderedMap`, then its entries will be appended. if it is a table of the
---form `{{key1 = val1}, {key2 = val2}, ...}` these will be appended.
---@param self pl.OrderedMap
---@param t {[any]: any}|{[any]: any}[]|pl.OrderedMap
---@return pl.OrderedMap? self -- the map, or `nil` in case of error
---@return string? error_message -- the error message
function OrderedMap:update(t) end

---set the key's value. This key will be appended at the end of the map.
---
---If the value is nil, then the key is removed.
---@param self pl.OrderedMap
---@param key any -- the key
---@param val any -- the value
---@return pl.OrderedMap self -- the map
function OrderedMap:set(key, val) end

OrderedMap.__newindex = OrderedMap.set

---insert a key/value pair before a given position. Note: if the map already
---contains the key, then this effectively moves the item to the new position
---by first removing at the old position. Has no effect if the key does not
---exist and val is `nil`
---@param self pl.OrderedMap
---@param pos integer -- a position starting at 1
---@param key any -- the key
---@param val any -- the value; if `nil` use the old value
---@return pl.OrderedMap self
function OrderedMap:insert(pos, key, val) end

---return the keys in order. (Not a copy!)
---@param self pl.OrderedMap
---@return pl.List
---@nodiscard
function OrderedMap:keys() end

---return the values in order. this is relatively expensive.
---@param self pl.OrderedMap
---@return pl.List
---@nodiscard
function OrderedMap:values() end

---sort the keys.
---@param self pl.OrderedMap
---@param cmp? fun(key1: any, key2: any): boolean -- a comparison function as for `table.sort`
---@return pl.OrderedMap self
function OrderedMap:sort(cmp) end

---iterate over key-value pairs in order.
---@param self pl.OrderedMap
---@return fun(): (any, any)
---@nodiscard
function OrderedMap:iter() end

---iterate over an ordered map (5.2).
OrderedMap.__pairs = OrderedMap.iter

---string representation of an ordered map.
---@param self pl.OrderedMap
---@return string
---@nodiscard
function OrderedMap:__tostring() end

return OrderedMap

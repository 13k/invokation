---@meta
---# Module [`pl.permute`](https://lunarmodules.github.io/Penlight/libraries/pl.permute.html)
---
---Permutation operations.
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [`pl.tablex`](https://lunarmodules.github.io/Penlight/libraries/pl.tablex.html#)
local permute = {}

---an iterator over all order-permutations of the elements of a list. Please
---note that the same list is returned each time, so do not keep references!
---@generic T
---@param a T[] -- a list-like table
---@return fun(): T[] -- an iterator which provides the next permutation as a list
---@nodiscard
function permute.order_iter(a) end

---construct a table containing all the order-permutations of a list.
---@generic T
---@param a T[] -- list-like table
---@return T[][] -- a table of tables
---@nodiscard
---
---Usage:
---
---```lua
---local results = permute.order_table {1,2,3}
----- results = {
-----   { 2, 3, 1 },
-----   { 3, 2, 1 },
-----   { 3, 1, 2 },
-----   { 1, 3, 2 },
-----   { 2, 1, 3 },
-----   { 1, 2, 3 },
----- }
---
---```
function permute.order_table(a) end

---an iterator over all permutations of the elements of the given lists.
---@param ... any[] -- list-like tables, they are nil-safe if a length-field `n` is provided (see `utils.pack`)
---@return fun(): (integer, ...: any) -- an iterator which provides the next permutation as return values in the same order as the provided lists, preceeded by an index
---@nodiscard
---
---Usage:
---
---```lua
---local strs = utils.pack("one", nil, "three")  -- adds an 'n' field for nil-safety
---local bools = utils.pack(true, false)
---local iter = permute.list_iter(strs, bools)
---
---print(iter())    --> 1, one, true
---print(iter())    --> 2, nil, true
---print(iter())    --> 3, three, true
---print(iter())    --> 4, one, false
---print(iter())    --> 5, nil, false
---print(iter())    --> 6, three, false
---```
function permute.list_iter(...) end

---construct a table containing all the permutations of a set of lists.
---@param ... any[] -- list-like tables, they are nil-safe if a length-field `n` is provided
---@return any[][] -- a list of lists, the sub-lists have an 'n' field for nil-safety
---@nodiscard
---
---Usage:
---
---```lua
---local strs = utils.pack("one", nil, "three")  -- adds an 'n' field for nil-safety
---local bools = utils.pack(true, false)
---local results = permute.list_table(strs, bools)
----- results = {
-----   { "one",   true,  n = 2 },
-----   { nil,     true,  n = 2 },
-----   { "three", true,  n = 2 },
-----   { "one",   false, n = 2 },
-----   { nil,     false, n = 2 },
-----   { "three", false, n = 2 },
----- }
---```
function permute.list_table(...) end

---@deprecated
---deprecated. Use `permute.order_iter`.
---@param ... any
function permute.iter(...) end

---@deprecated
---@param ... any
---deprecated. Use `permute.order_table`.
function permute.table(...) end

return permute

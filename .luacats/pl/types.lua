local utils = require("pl.utils")

---@meta
---# Module [`pl.types`](https://lunarmodules.github.io/Penlight/libraries/pl.types.html)
---
---Dealing with Detailed Type Information
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html)
local types = {}

---is the object either a function or a callable object?
---@param obj any -- Object to check.
---@return boolean
---@nodiscard
function types.is_callable(obj) end

types.is_type = utils.is_type

---a string representation of a type. For tables and userdata with metatables,
---we assume that the metatable has a `_name` field. If the field is not
---present it will return 'unknown table' or 'unknown userdata'. Lua file
---objects return the type 'file'.
---@param obj any -- an object
---@return string -- a string like 'number', 'table', 'file' or 'List'
---@nodiscard
function types.type(obj) end

---is this number an integer?
---@param x number -- a number
---@return boolean
---@nodiscard
---
---Raises: error if `x` is not a number
function types.is_integer(x) end

---Check if the object is "empty". An object is considered empty if it is:
---
--- * `nil`
--- * a table without any items (key-value pairs or indexes)
--- * a string with no content (`""`)
--- * not a nil/table/string
---@param o any -- The object to check if it is empty.
---@param ignore_spaces? boolean -- If the object is a string and this is `true`, the string is considered empty if it only contains spaces.
---@return boolean? -- `true` if the object is empty, otherwise a falsy value.
---@nodiscard
function types.is_empty(o, ignore_spaces) end

---is an object 'array-like'? An object is array like if:
---
--- * it is a table, or
--- * it has a metatable with `__len` and `__index` methods
---
---NOTE: since `__len` is 5.2+, on 5.1 it usually returns `false` for userdata
---
---@param val any -- any value
---@return boolean? -- `true` if the object is array-like, otherwise a falsy value.
---@nodiscard
function types.is_indexable(val) end

---can an object be iterated over with [`pairs`](https://www.lua.org/manual/5.1/manual.html#pdf-pairs)? An object is iterable if:
---
--- * it is a table, or
--- * it has a metatable with a `__pairs` meta method
---
---NOTE: since `__pairs` is 5.2+, on 5.1 it usually returns `false` for userdata
---
---@param val any -- any value
---@return boolean? -- `true` if the object is iterable, otherwise a falsy value.
---@nodiscard
function types.is_iterable(val) end

---can an object accept new key-value pairs? An object is iterable if:
---
--- * it is a table, or
--- * it has a metatable with a `__newindex` meta method
---
---@param val any -- any value
---@return boolean? -- `true` if the object is writeable, otherwise a falsy value.
---@nodiscard
function types.is_writeable(val) end

---Convert to a boolean value. True values are:
---
--- * `boolean`: true.
--- * `string`: `'yes'`, `'y'`, `'true'`, `'t'`, `'1'` or additional strings specified by `true_strs`.
--- * `number`: Any non-zero value.
--- * `table`: Is not empty and `check_objs` is true.
--- * everything else: Is not `nil` and `check_objs` is true.
---
---@param o any -- The object to evaluate
---@param true_strs? string[] -- Additional strings that when matched should evaluate to true. Comparison is case insensitive. This should be a List of strings. E.g. "ja" to support German.
---@param check_objs? boolean -- True if objects should be evaluated (default `false`).
---@return boolean -- `true` if the input evaluates to `true`, otherwise `false`.
---@nodiscard
function types.to_bool(o, true_strs, check_objs) end

return types

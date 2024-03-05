---@meta
---# Module [`pl.pretty`](https://lunarmodules.github.io/Penlight/libraries/pl.pretty.html)
---
---Pretty-printing Lua tables.
---
---Also provides a sandboxed Lua table reader and a function to present large
---numbers in human-friendly format.
---
---Dependencies:
--- [pl.utils](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [pl.lexer](https://lunarmodules.github.io/Penlight/libraries/pl.lexer.html#),
--- [pl.stringx](https://lunarmodules.github.io/Penlight/libraries/pl.stringx.html#),
--- [debug](https://www.lua.org/manual/5.1/manual.html#5.9)
---@overload fun(...)
local pretty = {}

---Read a string representation of a Lua table. This function loads and runs the
---string as Lua code, but bails out if it contains a function definition.
---Loaded string is executed in an empty environment.
---@param s string -- string to read in `{...}` format, possibly with some whitespace before or after the curly braces. A single line comment may be present at the beginning.
---@return table? -- a table in case of success, `nil` on fail.
---@return string? -- error message
---@nodiscard
function pretty.read(s) end

---Read a Lua chunk.
---@param s string -- Lua code.
---@param env? table -- environment used to run the code, empty by default.
---@param paranoid? boolean -- abort loading if any looping constructs are found in the code and disable string methods.
---@return table? -- the environment in case of success, `nil` on fail.
---@return string? -- syntax or runtime error if something went wrong.
function pretty.load(s, env, paranoid) end

---Create a string representation of a Lua table. This function never fails,
---but may complain by returning an extra value. Normally puts out one item per
---line, using the provided indent; set the second parameter to an empty string
---if you want output on one line.
---
---NOTE: this is NOT a serialization function, not a full blown debug function.
---Check out respectively the `serpent` or `inspect` Lua modules for that if you need them.
---@param tbl table -- Table to serialize to a string.
---@param space? string -- The indent to use. Defaults to two spaces; pass an empty string for no indentation.
---@param not_clever? boolean -- Pass true for plain output, e.g. `{['key']=1}`. Defaults to `false`.
---@return string -- a string
---@return string? -- an optional error message
---@nodiscard
function pretty.write(tbl, space, not_clever) end

---Dump a Lua table out to a file or stdout.
---@param t table -- The table to write to a file or stdout.
---@param filename? string -- File name to write to. Defaults to writing to stdout.
function pretty.dump(t, filename) end

---Dump a series of arguments to stdout for debug purposes. This function is
---attached to the module table __call method, to make it extra easy to access.
---So the full:
---
---```lua
---print(require("pl.pretty").write({...}))
---```
---
---Can be shortened to:
---
---```lua
---require"pl.pretty" (...)
---```
---
---Any `nil` entries will be printed as `"<nil>"` to make them explicit.
---@param ... any -- the parameters to dump to stdout.
---
---Usage:
---
---```lua
----- example debug output
---require"pl.pretty" ("hello", nil, "world", { bye = "world", true} )
---
----- output:
---{
---  ["arg 1"] = "hello",
---  ["arg 2"] = "<nil>",
---  ["arg 3"] = "world",
---  ["arg 4"] = {
---    true,
---    bye = "world"
---  }
---}
---```
function pretty.debug(...) end

---Format large numbers nicely for human consumption.
---@param num number -- a number.
---@param kind? string -- one of `'M'` (memory in KiB, MiB, etc.), `'N'` (postfixes are 'K', 'M' and 'B'), or `'T'` (use commas as thousands separator), `'N'` by default.
---@param prec? integer -- number of digits to use for 'M' and 'N', `1` by default.
---@return string
---@nodiscard
function pretty.number(num, kind, prec) end

return pretty

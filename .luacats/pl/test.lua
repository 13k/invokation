local utils = require("pl.utils")

---@meta
---# Module [`pl.test`](https://lunarmodules.github.io/Penlight/libraries/pl.test.html)
---
---Useful test utilities.
---
---```lua
---test.asserteq({1,2},{1,2}) -- can compare tables
---test.asserteq(1.2,1.19,0.02) -- compare FP numbers within precision
---T = test.tuple -- used for comparing multiple results
---test.asserteq(T(string.find(" me","me")),T(2,3))
---```
---
---Dependencies:
--- [pl.utils](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [pl.tablex](https://lunarmodules.github.io/Penlight/libraries/pl.tablex.html#),
--- [pl.pretty](https://lunarmodules.github.io/Penlight/libraries/pl.pretty.html#),
--- [pl.path](https://lunarmodules.github.io/Penlight/libraries/pl.path.html#),
--- [debug](https://www.lua.org/manual/5.1/manual.html#5.9)
local test = {}

---error handling for test results. By default, this writes to stderr and
---exits the program. Re-define this function to raise an error and/or redirect output
---comment
---@param file string
---@param line string|integer
---@param got_text string
---@param needed_text string
---@param msg? string -- (default `"these values were not equal"`)
function test.error_handler(file, line, got_text, needed_text, msg) end

---general test complain message. Useful for composing new test functions (see
---`tests/tablex.lua` for an example)
---@param x any -- a value
---@param y any -- value to compare first value against
---@param msg string -- message
---@param where? integer -- extra level offset for errors
function test.complain(x, y, msg, where) end

---like assert, except takes two arguments that must be equal and can be
---tables. If they are plain tables, it will use `tablex.deepcompare`.
---@param x any -- any value
---@param y any -- a value equal to x
---@param eps? number -- an optional tolerance for numerical comparisons
---@param where? integer -- extra level offset
function test.asserteq(x, y, eps, where) end

---assert that the first string matches the second.
---@param s1 string -- a string
---@param s2 string -- a string
---@param where? integer -- extra level offset
function test.assertmatch(s1, s2, where) end

---assert that the function raises a particular error.
---@param fn function|{ [1]: function, [integer]: any } -- a function or a table of the form {function, arg1, ...}
---@param e string -- a string to match the error against
---@param where? integer -- extra level offset
function test.assertraise(fn, e, where) end

---a version of asserteq that takes two pairs of values. `x1==y1` and `x2==y2`
---must be true. Useful for functions that naturally return two values.
---@param x1 any -- any value
---@param x2 any -- any value
---@param y1 any -- any value
---@param y2 any -- any value
---@param where? integer -- extra level offset
function test.asserteq2(x1, x2, y1, y2, where) end

---@class pl.Tuple
---@operator len: integer
local Tuple = {}

Tuple.unpack = utils.unpack

---encode an arbitrary argument list as a tuple. This can be used to compare
---to other argument lists, which is very useful for testing functions which
---return a number of values. Unlike regular array-like tables ('sequences')
---they may contain nils. Tuples understand equality and know how to print
---themselves out. The `#` operator is defined to be the size, irrespective of
---any nils, and there is an `unpack` method.
---@param ... any
---@return pl.Tuple
---@nodiscard
---
---Usage:
---
---```lua
---asserteq(tuple(('ab'):find 'a'), tuple(1, 1))
---```
function test.tuple(...) end

---Time a function. Call the function a given number of times, and report the
---number of seconds taken, together with a message. Any extra arguments will
---be passed to the function.
---@param msg string -- a descriptive message
---@param n integer -- number of times to call the function
---@param fun function -- the function
---@param ... any -- optional arguments to `fun`
function test.timer(msg, n, fun, ...) end

return test

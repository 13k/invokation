---@meta
---# Module [`pl.func`](https://lunarmodules.github.io/Penlight/libraries/pl.func.html)
---
---Functional helpers like composition, binding and placeholder expressions.
---
---Placeholder expressions are useful for short anonymous functions, and were
---inspired by the Boost Lambda library.
---
---```lua
---> utils.import 'pl.func'
---> ls = List{10,20,30}
---> = ls:map(_1+1)
---{11,21,31}
---```
---
---They can also be used to *bind* particular arguments of a function.
---```lua
---> p = bind(print,'start>',_0)
---> p(10,20,30)
---> start>   10   20  30
---```
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/07-functional.md.html#Creating_Functions_from_Functions)
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [`pl.tablex`](https://lunarmodules.github.io/Penlight/libraries/pl.tablex.html#)
local func = {}

---@class pl.PlaceholderExpression

---wrap a table of functions. This makes them available for use in placeholder expressions.
---@param tname string -- a table name
---@param context? table -- context to put results, defaults to environment of caller
function func.import(tname, context) end

---register a function for use in placeholder expressions.
---@param fun function -- a function
---@param name? string -- a name (optional)
---@return pl.PlaceholderExpression -- a placeholder function
function func.register(fun, name) end

---all elements of a table except the first.
---@generic T
---@param ls T[] -- a list-like table
---@return T[]
---@nodiscard
function func.tail(ls) end

---create a string representation of a placeholder expression.
---@param e pl.PlaceholderExpression|any -- a placeholder expression
---@return string
---@nodiscard
function func.repr(e) end

---instantiate a placeholder expression into an actual function. First we find
---the largest placeholder used, e.g. 2; from this a list of the formal
---parameters can be build. Then we collect and replace any non-PE values from
---the PE, and build up a constant binding list. Finally, the expression can be
---compiled, and `e.PEfunction` is set.
---@param e pl.PlaceholderExpression -- a placeholder expression
---@return function -- a function
function func.instantiate(e) end

---instantiate a placeholder expression unless it has already been done.
---@param e pl.PlaceholderExpression -- a placeholder expression
---@return function -- the function
function func.I(e) end

local empty = function() end

--- represents a variadic (`...`)
func._0 = func.register(empty)

--- represents argument #1
func._1 = func.register(empty)

--- represents argument #2
func._2 = func.register(empty)

--- represents argument #3
func._3 = func.register(empty)

--- represents argument #4
func._4 = func.register(empty)

--- represents argument #5
func._5 = func.register(empty)

---bind the first parameter of the function to a value.
---@generic T
---@param fn fun(p: T, ...: any): any -- a function of one or more arguments
---@param p T -- a value
---@return fun(...: any): any -- a function
---@nodiscard
---
---Usage:
---
---```lua
---(func.bind1(math.max,10))(20) == math.max(10,20)
---```
function func.bind1(fn, p) end

---@deprecated
func.curry = func.bind1

---create a function which chains two functions.
---@param f function -- a function of at least one argument
---@param g function -- a function of at least one argument
---@return function fog -- a function
---@nodiscard
---
---Usage:
---
---```lua
---printf = compose(io.write,string.format)
---```
function func.compose(f, g) end

---bind the arguments of a function to given values. `func.bind(fn,v,_2)` is equivalent to `func.bind1(fn,v)`.
---@param fn function -- a function of at least one argument
---@param ... any -- values or placeholder variables
---@return function -- a function
---@nodiscard
---
---Usage:
---
---```lua
---(bind(f, func._1, a))(b) == f(a,b)
---
---(bind(f, func._2, func._1))(a,b) == f(b,a)
---```
function func.bind(fn, ...) end

return func

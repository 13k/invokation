---@meta
---# Module [`pl.operator`](https://lunarmodules.github.io/Penlight/libraries/pl.operator.html)
---
---Lua operators available as functions.
---
---(similar to the Python module of the same name)
---
---There is a module field `optable` which maps the operator strings onto
---these functions, e.g. `operator.optable['()'] = =operator.call`
---
---Operator strings like `'>'` and `'{}'` can be passed to most Penlight functions
---expecting a function argument.
local operator = {}

---apply function to some arguments `()`
---@param fn fun(...: any): any -- a function or callable object
---@param ... any -- arguments
---@return any ...
---@nodiscard
function operator.call(fn, ...) end

---get the indexed value from a table `[]`
---@param t any -- a table or any indexable object
---@param k any -- the key
---@return any
---@nodiscard
function operator.index(t, k) end

---returns true if arguments are equal `==`
---@param a any -- value
---@param b any -- value
---@return boolean
---@nodiscard
function operator.eq(a, b) end

---returns true if arguments are not equal `~=`
---@param a any -- value
---@param b any -- value
---@return boolean
---@nodiscard
function operator.neq(a, b) end

---returns true if `a` is less than `b` `<`
---@param a any -- value
---@param b any -- value
---@return boolean
---@nodiscard
function operator.lt(a, b) end

---returns true if `a` is less or equal to `b` `<=`
---@param a any -- value
---@param b any -- value
---@return boolean
---@nodiscard
function operator.le(a, b) end

---returns true if `a` is greater than `b` `>`
---@param a any -- value
---@param b any -- value
---@return boolean
---@nodiscard
function operator.gt(a, b) end

---returns true if `a` is greater or equal to `b` `>=`
---@param a any -- value
---@param b any -- value
---@return boolean
---@nodiscard
function operator.ge(a, b) end

---returns length of string or table `#`
---@param a any -- a string or a table
---@return integer
---@nodiscard
function operator.len(a) end

---add two values `+`
---@param a any -- value
---@param b any -- value
---@return any
---@nodiscard
function operator.add(a, b) end

---subtract `b` from `a` `-`
---@param a any -- value
---@param b any -- value
---@return any
---@nodiscard
function operator.sub(a, b) end

---multiply two values `*`
---@param a any -- value
---@param b any -- value
---@return any
function operator.mul(a, b) end

---divide `a` by `b` `/`
---@param a any -- value
---@param b any -- value
---@return any
---@nodiscard
function operator.div(a, b) end

---raise `a` to the power of `b` `^`
---@param a any -- value
---@param b any -- value
---@return any
function operator.pow(a, b) end

---modulo; remainder of `a` divided by `b` `%`
---@param a any -- value
---@param b any -- value
---@return any
---@nodiscard
function operator.mod(a, b) end

---concatenate two values (either strings or `__concat` defined) `..`
---@param a any -- value
---@param b any -- value
---@return any
---@nodiscard
function operator.concat(a, b) end

---return the negative of a value `-`
---@param a any -- value
---@return any
---@nodiscard
function operator.unm(a) end

---false if value evaluates as true `not`
---@param a any -- value
---@return boolean
---@nodiscard
function operator.lnot(a) end

---true if both values evaluate as true `and`
---@param a any -- value
---@param b any -- value
---@return boolean
---@nodiscard
function operator.land(a, b) end

---true if either value evaluate as true `or`
---@param a any -- value
---@param b any -- value
---@return boolean
---@nodiscard
function operator.lor(a, b) end

---make a table from the arguments `{}`
---@param ... any -- non-nil arguments
---@return any[] -- a table
---@nodiscard
function operator.table(...) end

---match two strings `~`. uses `string.find`
---@param a string
---@param b string
---@return boolean
---@nodiscard
function operator.match(a, b) end

---the null operation.
---@param ... any -- arguments
---@return any ... -- the arguments
function operator.nop(...) end

---@alias pl.BoolBinOpString
---| "<"
---| "<="
---| ">"
---| ">="
---| "=="
---| "~="
---| "()"
---| "and"
---| "or"
---| "~"

--- Stores all the non-commutative boolean operators for sorting functions
---@alias pl.BoolOrderedBinOpString
---| "<"
---| "<="
---| ">"
---| ">="
---| "()"
---| "~"

---@alias pl.BinOpString
---| "+"
---| "-"
---| "*"
---| "/"
---| "%"
---| "^"
---| ".."
---| "()"
---| "{}"
---| "[]"
---| "<"
---| "<="
---| ">"
---| ">="
---| "=="
---| "~="
---| "and"
---| "or"
---| "~"
---| ""

-- apparently "# renders currently when compared to "#"

---@alias pl.UnOpString
---| "#"
---| "()"
---| "{}"
---| ""

---@alias pl.MultiOpString
---| "()"
---| "{}"
---| ""

---@alias pl.OpString
---| "+"
---| "-"
---| "*"
---| "/"
---| "%"
---| "^"
---| ".."
---| "()"
---| "{}"
---| "[]"
---| "<"
---| "<="
---| ">"
---| ">="
---| "=="
---| "~="
---| "and"
---| "or"
---| "~"
---| "#"
---| ""

---Map from operator symbol to function. Most of these map directly from
---operators; But note these extras
---
--- * `'()'` = call
--- * `'[]'` = index
--- * `'{}'` = table
--- * `'~'` = match
operator.optable = {
	["+"] = operator.add,
	["-"] = operator.sub,
	["*"] = operator.mul,
	["/"] = operator.div,
	["%"] = operator.mod,
	["^"] = operator.pow,
	[".."] = operator.concat,
	["()"] = operator.call,
	["[]"] = operator.index,
	["<"] = operator.lt,
	["<="] = operator.le,
	[">"] = operator.gt,
	[">="] = operator.ge,
	["=="] = operator.eq,
	["~="] = operator.neq,
	["#"] = operator.len,
	["and"] = operator.land,
	["or"] = operator.lor,
	["{}"] = operator.table,
	["~"] = operator.match,
	[""] = operator.nop,
}

return operator

---@meta
---# Module [`pl.seq`](https://lunarmodules.github.io/Penlight/libraries/pl.seq.html)
---
---Manipulating iterators as sequences.
---
---See [The Guide](https://lunarmodules.github.io/Penlight/manual/07-functional.md.html#Sequences)
---
---Dependencies:
--- [pl.utils](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [pl.types](https://lunarmodules.github.io/Penlight/libraries/pl.types.html#),
--- [debug](https://www.lua.org/manual/5.1/manual.html#5.9)
---@overload fun(iter: any[]|fun(): any|pl.Sequence): pl.Sequence
local seq = {}

---given a number, return a `function(y)` which returns `true` if `y > x`
---@param x number -- a number
---@return fun(y: number): boolean
---@nodiscard
function seq.greater_than(x) end

---given a number, returns a `function(y)` which returns `true` if `y < x`
---@param x any -- a value
---@return fun(y: any): boolean
---@nodiscard
function seq.less_than(x) end

---given any value, return a `function(y)` which returns `true` if `y == x`
---@param x number -- a number
---@return fun(y: number): boolean
---@nodiscard
function seq.equal_to(x) end

---given a string, return a `function(s)` which matches `s` against the string.
---@param pattern string -- a string
---@return fun(s: string): (integer?, integer?, ...: any?)
---@nodiscard
---
---Usage:
---
---```lua
---seq.matching(pattern)(s) == string.find(s, pattern)
---seq{s}:matching(pattern) == string.find(s, pattern)
---```
function seq.matching(pattern) end

---sequence adaptor for a table. Note that if any generic function is passed a
---table, it will automatically use `seq.list()`
---@generic T
---@param t T[] -- a list-like table
---@return fun(): T
---@nodiscard
---
---Usage:
---
---```lua
---seq(t):sum() --> the sum of all elements of t
---```
---
---```lua
---for x in list(t) do ... end
---```
function seq.list(t) end

---return the keys of the table.
---@generic K
---@param t { [K]: any } -- an arbitrary table
---@return fun(): K -- iterator over keys
---@nodiscard
function seq.keys(t) end

---@generic T
---@param iter T[]|fun(): T|pl.Sequence
---@return fun(): T
---@nodiscard
function seq.iter(iter) end

---create an iterator over a numerical range. Like the standard Python function xrange.
---@param start number -- a number
---@param finish number -- a number greater than `start`
---@return fun(): number
---@nodiscard
function seq.range(start, finish) end

---@generic T
---@param iter T[]|fun(): T|pl.Sequence
---@param condn fun(val: T): boolean
---@return integer
---@nodiscard
function seq.count(iter, condn) end

---@generic T, A
---@param iter T[]|fun(): T|pl.Sequence
---@param condn fun(val: T, arg: A): boolean
---@return integer
---@nodiscard
function seq.count(iter, condn) end

---count the number of elements in the sequence which satisfy the predicate
---@generic T, A
---@param iter T[]|fun(): T|pl.Sequence -- a sequence
---@param condn pl.BoolBinOpString -- a predicate function (must return either true or false)
---@param arg T -- optional argument to be passed to predicate as second argument.
---@return integer -- count
---@nodiscard
function seq.count(iter, condn, arg) end

---return the minimum and the maximum value of the sequence.
---@param iter number[]|fun(): number|pl.Sequence -- a sequence
---@return number -- minimum value
---@return number -- maximum value
---@nodiscard
function seq.minmax(iter) end

---return the sum and element count of the sequence.
---@param iter number[]|fun(): number|pl.Sequence -- a sequence
---@param fn? fun(val: number): number -- an optional function to apply to the values
---@return number -- the sum
---@return integer -- the element count
---@nodiscard
function seq.sum(iter, fn) end

---create a table from the sequence. (This will make the result in a `List`.)
---@generic T
---@param iter T[]|fun(): T -- a sequence
---@return pl.List -- a List
---@nodiscard
---
---Usage:
---
---```lua
---seq.copy(seq.list(ls)) == ls
---
---seq.copy(seq.list {1,2,3}) == List{1,2,3}
---```
function seq.copy(iter) end

---create a table of pairs from the double-valued sequence.
---@generic K, V, I1, I2
---@param iter fun(i1: I1, i2: I2): (K, V)|pl.Sequence -- a double-valued sequence
---@param i1? I1 -- used to capture extra iterator values as with `pairs` & `ipairs`
---@param i2? I2 -- used to capture extra iterator values as with `pairs` & `ipairs`
---@return { [1]: K, [2]: V }[] -- a list-like table
---@nodiscard
---
---Usage:
---
---```lua
---seq.copy2(ipairs{10,20,30}) == {{1,10},{2,20},{3,30}}
---```
function seq.copy2(iter, i1, i2) end

---create a table of 'tuples' from a multi-valued sequence.
---A generalization of `seq.copy2`
---@param iter any[]|fun(): (...: any)|pl.Sequence -- a multiple-valued sequence
---@return any[] -- a list-like table
---@nodiscard
function seq.copy_tuples(iter) end

---@param n integer
---@return fun(): number
---@nodiscard
function seq.random(n) end

---@param n integer
---@param l integer
---@return fun(): integer
---@nodiscard
function seq.random(n, l) end

---return an iterator of random numbers.
---@param n integer -- the length of the sequence
---@param l integer -- same as the first optional argument to `math.random`
---@param u integer -- same as the second optional argument to `math.random`
---@return fun(): integer -- a sequence
---@nodiscard
function seq.random(n, l, u) end

---return an iterator to the sorted elements of a sequence.
---@generic T
---@param iter fun(): T|pl.Sequence -- a sequence
---@param comp fun(a: T, b: T): boolean -- an optional comparison function (comp(x,y) is true if x < y)
---@return fun(): T
---@nodiscard
function seq.sort(iter, comp) end

---return an iterator which returns elements of two sequences.
---@generic T, U
---@param iter1 T[]|fun(): T|pl.Sequence -- a sequence
---@param iter2 U[]|fun(): U|pl.Sequence -- a sequence
---@return fun(): (T, U)
---@nodiscard
---
---Usage:
---
---```lua
---for x,y in seq.zip(ls1,ls2) do ... end
---```
function seq.zip(iter1, iter2) end

--- Makes a table where the key/values are the values and value counts of the sequence.
---
---This version works with 'hashable' values like strings and numbers.
---
---`pl.tablex.count_map` is more general.
---@generic T
---@param iter T[]|fun(): T|pl.Sequence -- a sequence
---@return pl.Map<T, integer> -- a map-like table
---@nodiscard
function seq.count_map(iter) end

---@generic T
---@param iter T[]|fun(): T|pl.Sequence
---@return fun(): T
---@nodiscard
function seq.unique(iter) end

---given a sequence, return all the unique values in that sequence.
---@generic T
---@param iter T[]|fun(): T|pl.Sequence -- a sequence
---@param returns_table true -- true if we return a table, not a sequence
---@return T[] -- a sequence or a table; defaults to a sequence.
---@nodiscard
function seq.unique(iter, returns_table) end

---print out a sequence iter with a separator.
---@generic T
---@param iter T[]|fun(): T|pl.Sequence -- a sequence
---@param sep? string -- the separator (default space)
---@param nfields? integer -- maximum number of values per line (default 7)
---@param fmt? fun(v: T): string -- optional format function for each value
function seq.printall(iter, sep, nfields, fmt) end

-- return an iterator running over every element of two sequences (concatenation).
---@generic T1, T2
---@param iter1 fun(): T1|pl.Sequence -- a sequence
---@param iter2 fun(): T2|pl.Sequence -- a sequence
---@return fun(): T1|T2
---@nodiscard
function seq.splice(iter1, iter2) end

---@generic K, A, R
---@param fn fun(value1: K, value2: A): R
---@param iter fun(): (K, A)|pl.Sequence
---@return fun(): R
---@nodiscard
function seq.map(fn, iter) end

---return a sequence where every element of a sequence has been transformed by
---a function. If you don't supply an argument, then the function will receive
---both values of a double-valued sequence, otherwise behaves rather like
---`tablex.map`.
---@generic K, A, R
---@param fn pl.BinOpString|pl.UnOpString|fun(value1: K, value2: A): R -- a function to apply to elements; may take two arguments
---@param iter K[]|fun(): K|pl.Sequence -- a sequence of one or two values
---@param arg A -- optional argument to pass to function.
---@return fun(): R
---@nodiscard
function seq.map(fn, iter, arg) end

---@generic K, A
---@param iter fun(): (K, A)|pl.Sequence
---@param pred fun(value1: K, value2: A): boolean
---@return fun(): (K, A)
---@nodiscard
function seq.filter(iter, pred) end

---@generic K, A
---@param iter fun(): (K, A)|pl.Sequence
---@param pred pl.BoolBinOpString
---@return fun(): (K, A)
---@nodiscard
function seq.filter(iter, pred) end

---@generic K, A
---@param iter fun(): K|pl.Sequence
---@param pred fun(value1: K, value2: A): boolean
---@param arg A
---@return fun(): K
---@nodiscard
function seq.filter(iter, pred, arg) end

---filter a sequence using a predicate function.
---@generic K, A
---@param iter fun(): K|pl.Sequence -- a sequence of one or two values
---@param pred pl.BoolBinOpString -- a boolean function; may take two arguments
---@param arg A -- optional argument to pass to function.
---@return fun(): K
---@nodiscard
function seq.filter(iter, pred, arg) end

---@generic L, T
---@param fn fun(last: L, current: T): L
---@param iter fun(): T|pl.Sequence
---@param initval L
---@return L
---@nodiscard
function seq.reduce(fn, iter, initval) end

---'reduce' a sequence using a binary function.
---@generic L, T
---@param fn pl.BinOpString -- a function of two arguments
---@param iter fun(): T|pl.Sequence -- a sequence
---@param initval L -- optional initial value
---@return L
---@nodiscard
---
---Usage:
---
---```lua
---seq.reduce(operator.add,seq.list{1,2,3,4}) == 10
---
---seq.reduce('-',{1,2,3,4,5}) == -13
---```
function seq.reduce(fn, iter, initval) end

---@generic T
---@param fn fun(last: T, current: T): T
---@param iter fun(): T|pl.Sequence
---@return T
---@nodiscard
function seq.reduce(fn, iter) end

---@generic T
---@param fn pl.BinOpString
---@param iter fun(): T|pl.Sequence
---@return T
---@nodiscard
function seq.reduce(fn, iter) end

---take the first `n` values from the sequence.
---@generic T
---@param iter T[]|fun(): T|pl.Sequence -- a sequence of one or two values
---@param n integer -- number of items to take
---@return fun(): T -- a sequence of at most `n` items
---@nodiscard
function seq.take(iter, n) end

---skip the first `n` values of a sequence
---@generic T
---@param iter T[]|fun(): T|pl.Sequence -- a sequence of one or more values
---@param n integer -- number of items to skip
---@return fun(): T
---@nodiscard
function seq.skip(iter, n) end

--- a sequence with a sequence count and the original value.
---`enum(copy(ls))` is a roundabout way of saying `ipairs(ls)`.
---@generic T1, T2
---@param iter T1[]|fun(): (T1, T2)|pl.Sequence -- a single or double valued sequence
---@return fun(): (integer, T1, T2) -- sequence of (i,v), i = 1..n and v is from iter.
---@nodiscard
function seq.enum(iter) end

---@alias pl.ObjectWithMethodAndTwoArguments<S, A1, A2> { [S]: fun(self: pl.ObjectWithMethodAndTwoArguments<S, A1, A2, any>, arg1: A1, arg2: A2, ...: any): (...: any) }
---@alias pl.ObjectWithMethodAndOneArgument<S, A> { [S]: fun(self: pl.ObjectWithMethodAndOneArgument<S, A, any>, arg1: A): (...: any) }
---@alias pl.ObjectWithMethodAndNoArguments<S> { [S]: fun(self: pl.ObjectWithMethodAndNoArguments<S, any>): (...: any) }

---map using a named method over a sequence.
---@generic S, A1, A2
---@param iter pl.ObjectWithMethodAndTwoArguments<S, A1, A2>[]|(fun(): pl.ObjectWithMethodAndTwoArguments<S, A1, A2>)|pl.Sequence -- a sequence
---@param name S -- the method name
---@param arg1 A1 -- optional first extra argument
---@param arg2 A2 -- optional second extra argument
---@return fun(): (...: any)
---@nodiscard
function seq.mapmethod(iter, name, arg1, arg2) end

---@generic S, A
---@param iter pl.ObjectWithMethodAndOneArgument<S, A>[]|(fun(): pl.ObjectWithMethodAndOneArgument<S, A>)|pl.Sequence
---@param name S
---@param arg1 A
---@return fun(): (...: any)
---@nodiscard
function seq.mapmethod(iter, name, arg1) end

---@generic S
---@param iter pl.ObjectWithMethodAndNoArguments<S>[]|(fun(): pl.ObjectWithMethodAndNoArguments<S>)|pl.Sequence
---@param name S
---@return fun(): (...: any)
---@nodiscard
function seq.mapmethod(iter, name) end

---returns a sequence of (last,current) values from another sequence.
---This will return S(i-1),S(i) if given S(i)
---@generic T
---@param iter T[]|fun(): T|pl.Sequence -- a sequence
---@nodiscard
---@return fun(): (T, T)
function seq.last(iter) end

---call the function on each element of the sequence.
---@generic T
---@param iter T[] -- a sequence with up to 3 values
---@param fn fun(v: T) -- a function
function seq.foreach(iter, fn) end

---call the function on each element of the sequence.
---@generic T1, T2, T3
---@param iter fun(): (T1, T2, T3)|pl.Sequence -- a sequence with up to 3 values
---@param fn fun(v1: T1, v2: T2, v3: T3) -- a function
function seq.foreach(iter, fn) end

---@class pl.Sequence
---@overload fun(): any
---@field iter fun(...: any): (...: any)
local Sequence = {}

---count the number of elements in the sequence which satisfy the predicate
---@generic T, A
---@param self pl.Sequence
---@param condn pl.BoolBinOpString|fun(val: T, arg: A): boolean -- a predicate function (must return either true or false)
---@param arg A -- optional argument to be passed to predicate as second argument.
---@return integer -- count
---@nodiscard
function Sequence:count(condn, arg) end

---@generic T
---@param self pl.Sequence
---@param condn fun(val: T): boolean
---@return integer
---@nodiscard
function Sequence:count(condn) end

---return the minimum and the maximum value of the sequence.
---@generic T: number
---@param self pl.Sequence
---@return number -- minimum value
---@return number -- maximum value
---@nodiscard
function Sequence:minmax() end

---return the sum and element count of the sequence.
---@generic T: number
---@param self pl.Sequence
---@param fn? fun(val: number): number -- an optional function to apply to the values
---@return number -- the sum
---@return integer -- the element count
---@nodiscard
function Sequence:sum(fn) end

--- create a table from the sequence. (This will make the result in a `List`.)
---@generic T
---@param self pl.Sequence
---@return pl.List -- a List
---@nodiscard
---
---Usage:
---
---```lua
---seq.copy(seq.list(ls)) == ls
---
---seq.copy(seq.list {1,2,3}) == List{1,2,3}
---```
function Sequence:copy() end

---create a table of pairs from the double-valued sequence.
---@generic K, V, I1, I2
---@param self pl.Sequence
---@param i1? I1 -- used to capture extra iterator values as with `pairs` & `ipairs`
---@param i2? I2 -- used to capture extra iterator values as with `pairs` & `ipairs`
---@return { [1]: K, [2]: V }[] -- a list-like table
---@nodiscard
---
---Usage:
---
---```lua
---seq(ipairs{}):copy2({10,20,30}, 0) == {{1,10},{2,20},{3,30}}
---```
function Sequence:copy2(i1, i2) end

---create a table of 'tuples' from a multi-valued sequence.
---A generalization of `seq.copy2`
---@param self pl.Sequence
---@return any[] -- a list-like table
---@nodiscard
function Sequence:copy_tuples() end

---return an iterator to the sorted elements of a sequence.
---@generic T
---@param self pl.Sequence
---@param comp fun(a: T, b: T): boolean -- an optional comparison function (comp(x,y) is true if x < y)
---@return pl.Sequence
---@nodiscard
function Sequence:sort(comp) end

---return an iterator which returns elements of two sequences.
---@generic T, U
---@param self pl.Sequence
---@param iter2 U[]|fun(): U|pl.Sequence -- a sequence
---@return pl.Sequence
---@nodiscard
---
---Usage:
---
---```lua
---for x,y in seq.zip(ls1,ls2) do ... end
---```
function Sequence:zip(iter2) end

--- Makes a table where the key/values are the values and value counts of the sequence.
---
---This version works with 'hashable' values like strings and numbers.
---
---`pl.tablex.count_map` is more general.
---@generic T
---@param self pl.Sequence -- a sequence
---@return pl.Map<T, integer> -- a map-like table
---@nodiscard
function Sequence:count_map() end

---given a sequence, return all the unique values in that sequence.
---@generic T
---@param self pl.Sequence -- a sequence
---@param returns_table true -- true if we return a table, not a sequence
---@return T[] -- a sequence or a table; defaults to a sequence.
---@nodiscard
function Sequence:unique(returns_table) end

---@generic T
---@param self pl.Sequence
---@return pl.Sequence
---@nodiscard
function Sequence:unique() end

---print out a sequence iter with a separator.
---@generic T
---@param self pl.Sequence -- a sequence
---@param sep? string -- the separator (default space)
---@param nfields? integer -- maximum number of values per line (default 7)
---@param fmt? fun(v: T): string -- optional format function for each value
function Sequence:printall(sep, nfields, fmt) end

-- return an iterator running over every element of two sequences (concatenation).
---@generic T2
---@param self pl.Sequence
---@param iter2 fun(): T2|pl.Sequence -- a sequence
---@return pl.Sequence
---@nodiscard
function Sequence:splice(iter2) end

---return a sequence where every element of a sequence has been transformed by
---a function. If you don't supply an argument, then the function will receive
---both values of a double-valued sequence, otherwise behaves rather like
---`tablex.map`.
---@generic K, A, R
---@param self pl.Sequence
---@param fn fun(value1: K, value2: A): R -- a function to apply to elements; may take two arguments
---@param arg A -- optional argument to pass to function.
---@return pl.Sequence
---@nodiscard
function Sequence:map(fn, arg) end

---@generic A
---@param self pl.Sequence
---@param fn pl.BinOpString|pl.UnOpString
---@param arg A
---@return pl.Sequence
---@nodiscard
function Sequence:map(fn, arg) end

---@generic K, A, R
---@param self pl.Sequence
---@param fn fun(value1: K, value2: A): R
---@return pl.Sequence
---@nodiscard
function Sequence:map(fn) end

---@param self pl.Sequence
---@param fn pl.BinOpString|pl.UnOpString
---@return pl.Sequence
---@nodiscard
function Sequence:map(fn) end

---filter a sequence using a predicate function.
---@generic K, A
---@param self pl.Sequence
---@param pred fun(value1: K, value2: A): boolean -- a boolean function; may take two arguments
---@param arg A -- optional argument to pass to function.
---@return pl.Sequence
---@nodiscard
function Sequence:filter(pred, arg) end

---filter a sequence using a predicate function.
---@generic K, A
---@param self pl.Sequence
---@param pred pl.BoolBinOpString
---@param arg A
---@return pl.Sequence
---@nodiscard
function Sequence:filter(pred, arg) end

---@generic K, A
---@param self pl.Sequence
---@param pred fun(value1: K, value2: A): boolean
---@return pl.Sequence
---@nodiscard
function Sequence:filter(pred) end

---@generic K, A
---@param self pl.Sequence
---@param pred pl.BoolBinOpString
---@return pl.Sequence
---@nodiscard
function Sequence:filter(pred) end

---'reduce' a sequence using a binary function.
---@generic L, T
---@param self pl.Sequence
---@param fn fun(last: L, current: T): L -- a function of two arguments
---@param initval L -- optional initial value
---@return L
---@nodiscard
---
---Usage:
---
---```lua
---seq.reduce(operator.add,seq.list{1,2,3,4}) == 10
---
---seq.reduce('-',{1,2,3,4,5}) == -13
---```
function Sequence:reduce(fn, initval) end

---@generic L, T
---@param self pl.Sequence
---@param fn pl.BinOpString
---@param initval L
---@return L
---@nodiscard
function Sequence:reduce(fn, initval) end

---@generic T
---@param self pl.Sequence
---@param fn fun(last: T, current: T): T
---@return T
---@nodiscard
function Sequence:reduce(fn) end

---@generic T
---@param self pl.Sequence
---@param fn pl.BinOpString
---@return T
---@nodiscard
function Sequence:reduce(fn) end

---take the first `n` values from the sequence.
---@param self pl.Sequence
---@param n integer -- number of items to take
---@return pl.Sequence
---@nodiscard
function Sequence:take(n) end

---skip the first `n` values of a sequence
---@param self pl.Sequence
---@param n integer -- number of items to skip
---@return pl.Sequence
---@nodiscard
function Sequence:skip(n) end

--- a sequence with a sequence count and the original value.
---`enum(copy(ls))` is a roundabout way of saying `ipairs(ls)`.
---@param self pl.Sequence
---@return pl.Sequence
---@nodiscard
function Sequence:enum() end

---map using a named method over a sequence.
---@param self pl.Sequence
---@param name string -- the method name
---@param arg1 any -- optional first extra argument
---@param arg2 any -- optional second extra argument
---@return pl.Sequence
---@nodiscard
function Sequence:mapmethod(name, arg1, arg2) end

---@param self pl.Sequence
---@param name string
---@param arg1 any
---@return pl.Sequence
---@nodiscard
function Sequence:mapmethod(name, arg1) end

---@param self pl.Sequence
---@param name string
---@return pl.Sequence
---@nodiscard
function Sequence:mapmethod(name) end

---returns a sequence of (last,current) values from another sequence.
---This will return S(i-1),S(i) if given S(i)
---@generic T
---@param self pl.Sequence
---@return pl.Sequence
---@nodiscard
function Sequence:last() end

---call the function on each element of the sequence.
---@param self pl.Sequence
---@param fn fun(v1: any, v2: any, v3: any) -- a function
function Sequence:foreach(fn) end

return seq

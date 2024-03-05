---@meta
---# Module [`pl.tablex`](https://lunarmodules.github.io/Penlight/libraries/pl.tablex.html)
---
---Extended operations on Lua tables.
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/02-arrays.md.html#Useful_Operations_on_Tables)
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [`pl.types`](https://lunarmodules.github.io/Penlight/libraries/pl.types.html#)
local tablex = {}

---total number of elements in this table. Note that this is distinct from
---`#t`, which is the number of values in the array part; this value will
---always be greater or equal. The difference gives the size of the hash part,
---for practical purposes. Works for any object with a `__pairs` metamethod.
---@param t table -- a table
---@return integer -- the size
---@nodiscard
function tablex.size(t) end

---return a list of all values in a table indexed by another list.
---@generic K, V
---@param tbl { [K]: V } -- a table
---@param idx K[] -- an index table (a list of keys)
---@return V[] -- a list-like table
---@nodiscard
---
---Usage:
---
---```lua
---index_by({10, 20, 30, 40}, {2, 4}) == {20, 40}
---
---index_by({one=1, two=2, three=3}, {'one', 'three'}) == {1, 3}
---```
function tablex.index_by(tbl, idx) end

---@param fun fun(val: any, ...: any): any
---@param t table
---@param ... any
---@return table t
function tablex.transform(fun, t, ...) end

---apply a function to all values of a table, in-place. Any extra arguments are
---passed to the function.
---@param fun pl.OpString -- A function that takes at least one argument
---@param t table -- a table
---@param ... any -- extra arguments passed to `fun`
---@return table t
function tablex.transform(fun, t, ...) end

---generate a table of all numbers in a range. This is consistent with a
---numerical for loop.
---@param start integer -- number
---@param finish integer -- number
---@param step? integer -- make this negative for `start < finish` (default 1)
---@return integer[]
---@nodiscard
function tablex.range(start, finish, step) end

---@generic T
---@param fun fun(memo: T, val: T): T
---@param t T[]
---@return T
---@nodiscard
function tablex.reduce(fun, t) end

---@generic T, U
---@param fun fun(memo: U, val: T): U
---@param t T[]
---@param memo U
---@return U
---@nodiscard
function tablex.reduce(fun, t, memo) end

---'reduce' a list using a binary function.
---@param fun pl.BinOpString -- a function of two arguments
---@param t any[] -- a list-like table
---@param memo? any -- optional initial memo value. Defaults to first value in table.
---@return any -- the result of the function
---@nodiscard
---
---Usage:
---
---```lua
---reduce('+', {1, 2, 3, 4}) == 10
---```
function tablex.reduce(fun, t, memo) end

---create an index map from a list-like table. The original values become keys,
---and the associated values are the indices into the original list.
---@generic T
---@param t T[] -- a list-like table
---@return {[T]: integer} -- a map-like table
---@nodiscard
function tablex.index_map(t) end

---create a set from a list-like table. A set is a table where the original
---values become keys, and the associated values are all true.
---@generic T
---@param t T[] -- a list-like table
---@return pl.Set<T> -- a set (a map-like table)
---@nodiscard
function tablex.makeset(t) end

---the union of two map-like tables. If there are duplicate keys, the second
---table wins.
---@param t1 table -- a table
---@param t2 table -- a table
---@return table
---@nodiscard
function tablex.union(t1, t2) end

---the intersection of two map-like tables.
---@param t1 table -- a table
---@param t2 table -- a table
---@return table
---@nodiscard
function tablex.intersection(t1, t2) end

---@generic T
---@param t T[]
---@param cmp? fun(a: T, b: T): boolean
---@return { [T]: integer }
---@nodiscard
function tablex.count_map(t, cmp) end

---A table where the key/values are the values and value counts of the table.
---@generic T
---@param t T[] -- a list-like table
---@param cmp? pl.BoolBinOpString -- a function that defines equality (otherwise uses `==`)
---@return { [T]: integer } -- a map-like table
---@nodiscard
function tablex.count_map(t, cmp) end

---set an array range to a value. If it's a function we use the result of applying it to the indices.
---@generic T
---@param t T[] -- a list-like table
---@param val T -- a value
---@param i1? integer -- start range (default `1`)
---@param i2? integer -- end range (default `#t`)
function tablex.set(t, val, i1, i2) end

---create a new array of specified size with initial value.
---@generic T
---@param n integer -- size
---@param val? T -- an initial value (can be `nil`, but don't expect `#` to work!)
---@return T[] -- a table
---@nodiscard
function tablex.new(n, val) end

---clear out the contents of a table.
---@param t any[] -- a list
---@param istart? integer -- optional start position
function tablex.clear(t, istart) end

---remove a range of values from a table. End of range may be negative.
---@generic T
---@param t T[] -- a list-like table
---@param i1? integer -- start index
---@param i2? integer -- end index
---@return T[] t -- the table
function tablex.removevalues(t, i1, i2) end

---modifies a table to be read only. This only offers weak protection. Tables
---can still be modified with `table.insert` and `rawset`.
---
---NOTE: for Lua 5.1 length, pairs and ipairs will not work, since the
---equivalent metamethods are only available in Lua 5.2 and newer.
---@param t table -- the table
---@return table -- the table read only (a proxy).
---@nodiscard
function tablex.readonly(t) end

---copy a table into another, in-place.
---@param dest table -- destination table
---@param src table -- source (actually any iterable object)
---@return table dest -- first table
function tablex.update(dest, src) end

---make a shallow copy of a table
---@param t table -- an iterable source
---@return table -- new table
---@nodiscard
function tablex.copy(t) end

---make a deep copy of a table, recursively copying all the keys and fields.
---This supports cycles in tables; cycles will be reproduced in the copy. This
---will also set the copied table's metatable to that of the original.
---@param t table -- A table
---@return table -- new table
---@nodiscard
function tablex.deepcopy(t) end

---copy an array into another one, clearing `dest` after `idest+nsrc`, if
---necessary.
---@param dest any[] -- a list-like table
---@param src any[] -- a list-like table
---@param idest? integer -- where to start copying values into destination (default 1)
---@param isrc? integer -- where to start copying values from source (default 1)
---@param nsrc? integer -- number of elements to copy from source (default `#src`)
---@return any[] dest
function tablex.icopy(dest, src, idest, isrc, nsrc) end

---copy an array into another one.
---@param dest any[] -- a list-like table
---@param src any[] -- a list-like table
---@param idest? integer -- where to start copying values into destination (default 1)
---@param isrc? integer -- where to start copying values from source (default 1)
---@param nsrc? integer -- number of elements to copy from source (default `#src`)
---@return any[] dest
function tablex.move(dest, src, idest, isrc, nsrc) end

---insert values into a table. similar to `table.insert` but inserts values
---from given table values, not the object itself, into table `t` at position
---`pos`.
---@param t any[] -- the list
---@param pos? integer -- (default is at end)
---@param values any[]
---@return any[] t -- table argument
function tablex.insertvalues(t, pos, values) end

---compare two values. if they are tables, then compare their keys and fields
---recursively.
---@param t1 any -- A value
---@param t2 any -- A value
---@param ignore_mt? boolean -- if `true`, ignore `__eq` metamethod (default `false`)
---@param eps? number -- if defined, then used for checking nearness in any number comparisons
---@return boolean
---@nodiscard
function tablex.deepcompare(t1, t2, ignore_mt, eps) end

---@param t1 any[]
---@param t2 any[]
---@param cmp fun(v1: any, v2: any): boolean
---@return boolean
---@nodiscard
function tablex.compare(t1, t2, cmp) end

---compare two arrays using a predicate.
---@param t1 any[] -- an array
---@param t2 any[] -- an array
---@param cmp pl.BoolBinOpString -- A comparison function; `bool = cmp(t1_value, t2_value)`
---@return boolean
---@nodiscard
---
---Usage:
---
---```lua
---assert(tablex.compare({ 1, 2, 3 }, { 1, 2, 3 }, "=="))
---
---assert(tablex.compare(
---   {1, 2, 3, hello = "world"},  -- fields are not compared!
---   {1, 2, 3}, function(v1, v2) return v1 == v2 end)
---```
function tablex.compare(t1, t2, cmp) end

---@param t1 any[]
---@param t2 any[]
---@param cmp? fun(v1: any, v2: any): boolean
---@return boolean
---@nodiscard
function tablex.compare_no_order(t1, t2, cmp) end

---compare two list-like tables using an optional predicate, without regard
---for element order.
---@param t1 any[] -- a list-like table
---@param t2 any[] -- a list-like table
---@param cmp? pl.BoolBinOpString -- A comparison function (may be nil)
---@return boolean
---@nodiscard
function tablex.compare_no_order(t1, t2, cmp) end

---return the index of a value in a list. Like `string.find`, there is an
---optional index to start searching, which can be negative.
---@generic T
---@param t T[] -- A list-like table
---@param val T -- A value
---@param idx? integer -- index to start; `-1` means last element, etc (default `1`)
---@return integer? -- index of value or `nil` if not found
---@nodiscard
---
---Usage:
---
---```lua
---tablex.find({10, 20, 30}, 20) == 2
---tablex.find({'a', 'b', 'a', 'c'}, 'a', 2) == 3
---```
function tablex.find(t, val, idx) end

---return the index of a value in a list, searching from the end. Like
---`string.find`, there is an optional index to start searching, which can be
---negative.
---@generic T
---@param t T[] -- A list-like table
---@param val T -- A value
---@param idx? integer -- index to start; `-1` means last element, etc (default `#t`)
---@return integer? -- index of value or nil if not found
---@nodiscard
---
---Usage:
---
---```lua
---tablex.rfind({10,10,10},10) == 3
---```
function tablex.rfind(t, val, idx) end

---@param t table
---@param cmp fun(v, arg): any
---@param arg? any
---@return any?, any
function tablex.find_if(t, cmp, arg) end

---return the index (or key) of a value in a table using a comparison function.
---NOTE: the 2nd return value of this function, the value returned by the
---comparison function, has a limitation that it cannot be false. Because if it
---is, then it indicates the comparison failed, and the function will continue
---the search. See examples.
---@param t table -- A table
---@param cmp pl.BoolBinOpString -- A comparison function
---@param arg? any -- an optional second argument to the function
---@return any? -- index of value, or nil if not found
---@return boolean? -- value returned by comparison function (cannot be `false`!)
---@nodiscard
---
---Usage:
---
---```lua
----- using an operator
---local lst = { "Rudolph", true, false, 15 }
---local idx, cmp_result = tablex.rfind(lst, "==", "Rudolph")
---assert(idx == 1)
---assert(cmp_result == true)
---
---local idx, cmp_result = tablex.rfind(lst, "==", false)
---assert(idx == 3)
---assert(cmp_result == true)       -- looking up 'false' works!
---
----- using a function returning the value looked up
---local cmp = function(v1, v2) return v1 == v2 and v2 end
---local idx, cmp_result = tablex.rfind(lst, cmp, "Rudolph")
---assert(idx == 1)
---assert(cmp_result == "Rudolph")  -- the value is returned
---
----- NOTE: this fails, since 'false' cannot be returned!
---local idx, cmp_result = tablex.rfind(lst, cmp, false)
---assert(idx == nil)               -- looking up 'false' failed!
---assert(cmp_result == nil)
---```
function tablex.find_if(t, cmp, arg) end

---find a value in a table by recursive search.
---@param t table -- the table
---@param value any -- the value
---@param exclude? table[] -- any tables to avoid searching
---@return string -- a fieldspec, e.g. `'a.b'` or `'math.sin'`
---@nodiscard
---
---Usage:
---
---```lua
---tablex.search(_G, math.sin, {package.path}) == 'math.sin'
---```
function tablex.search(t, value, exclude) end

---@param fun fun(val, ...): any
---@param t table
---@param ... any
---@return table
---@nodiscard
function tablex.map(fun, t, ...) end

---apply a function to all values of a table. This returns a table of the
---results. Any extra arguments are passed to the function.
---@param fun pl.OpString -- A function that takes at least one argument
---@param t table -- A table
---@param ... any -- optional arguments
---@return table
---@nodiscard
---
---Usage:
---
---```lua
---tablex.map(function(v) return v*v end, {10, 20, 30, fred=2}) == {100, 400, 900, fred=4}
---```
function tablex.map(fun, t, ...) end

---@generic T, U
---@param fun fun(val: T, ...: any): U
---@param t T[]
---@param ... any
---@return pl.List
---@nodiscard
function tablex.imap(fun, t, ...) end

---apply a function to all values of a list. This returns a table of the
---results. Any extra arguments are passed to the function.
---@generic T
---@param fun pl.OpString -- A function that takes at least one argument
---@param t T[] -- a table (applies to array part)
---@param ... any -- optional arguments
---@return pl.List -- a list-like table
---@nodiscard
---
---Usage:
---
---```lua
---tablex.imap(function(v) return v*v end, {10, 20, 30, fred=2}) == {100, 400, 900}
---```
function tablex.imap(fun, t, ...) end

---@alias pl.ObjectWithMethod<S, A..., R> { [S]: fun(self: pl.ObjectWithMethod<S, A..., R>, ...: A...): R }

---apply a named method to values from a table.
---@param name string -- the method name
---@param t table[] -- a list-like table
---@param ... any -- extra arguments to the method
---@return pl.List -- a List with the results of the method (1st result only)
---@nodiscard
---
---Usage:
---
---```lua
---local Car = {}
---Car.__index = Car
---function Car.new(car)
---  return setmetatable(car or {}, Car)
---end
---Car.speed = 0
---function Car:faster(increase)
---  self.speed = self.speed + increase
---  return self.speed
---end
---
---local ferrari = Car.new{ name = "Ferrari" }
---local lamborghini = Car.new{ name = "Lamborghini", speed = 50 }
---local cars = { ferrari, lamborghini }
---
---assert(ferrari.speed == 0)
---assert(lamborghini.speed == 50)
---tablex.map_named_method("faster", cars, 10)
---assert(ferrari.speed == 10)
---assert(lamborghini.speed == 60)
---```
function tablex.map_named_method(name, t, ...) end

---@param fun fun(val1, val2, ...): any
---@param t1 table
---@param t2 table
---@param ... any
---@return table
---@nodiscard
function tablex.map2(fun, t1, t2, ...) end

---apply a function to values from two tables.
---@param fun pl.OpString -- a function of at least two arguments
---@param t1 table -- a table
---@param t2 table -- a table
---@param ... any -- extra arguments
---@return table -- a table
---@nodiscard
---
---Usage:
---
---```lua
---tablex.map2('+', {1, 2, 3, m=4}, {10, 20, 30, m=40}) == {11, 22, 33, m=44}
---```
function tablex.map2(fun, t1, t2, ...) end

---@param fun fun(val1, val2, ...): any
---@param t1 any[]
---@param t2 any[]
---@param ... any
---@return any[]
---@nodiscard
function tablex.imap2(fun, t1, t2, ...) end

---apply a function to values from two arrays. The result will be the length of the shortest array.
---@param fun pl.OpString -- a function of at least two arguments
---@param t1 any[] -- a list-like table
---@param t2 any[] -- a list-like table
---@param ... any -- extra arguments
---@return any[]
---@nodiscard
---
---Usage:
---
---```lua
---tablex.imap2('+', {1, 2, 3, m=4}, {10, 20, 30, m=40}) == {11, 22, 33}
---```
function tablex.imap2(fun, t1, t2, ...) end

---@param fun function
---@param ... table
---@return table
---@nodiscard
function tablex.mapn(fun, ...) end

---Apply a function to a number of tables. A more general version of
---`tablex.map`. The result is a table containing the result of applying that
---function to the ith value of each table. Length of output list is the
---minimum length of all the lists
---@param fun pl.OpString -- A function that takes `n` tables
---@param ... table -- `n` tables
---@return table
---@nodiscard
---
---Usage:
---
---```lua
---mapn(function(x,y,z) return x+y+z end, {1, 2, 3}, {10, 20, 30}, {100, 200, 300}) == {111, 222, 333}
---
---mapn(math.max, {1, 20, 300}, {10, 2, 3}, {100, 200, 100}) == {100, 200, 300}
---```
function tablex.mapn(fun, ...) end

---@param fun fun(k, v, ...: any): (new_v: any, new_k: any)
---@param t table
---@param ... any
---@return table
---@nodiscard
function tablex.pairmap(fun, t, ...) end

---call the function with the key and value pairs from a table. The function
---can return a value and a key (note the order!). If both are not nil, then
---this pair is inserted into the result: if the key already exists, we convert
---the value for that key into a table and append into it. If only value is not
---nil, then it is appended to the result.
---@param fun pl.OpString -- A function which will be passed each key and value as arguments, plus any extra arguments to `tablex.pairmap`.
---@param t table -- A table
---@param ... any -- optional arguments
---@return table
---@nodiscard
---
---Usage:
---
---```lua
---pairmap(function(k,v) return v end,{fred=10,bonzo=20}) == {10,20} or {20,10}
---
---pairmap(function(k, v) return {k, v}, k end,{one=1, two=2}) == {one={'one', 1}, two={'two', 2}}
---```
function tablex.pairmap(fun, t, ...) end

---@generic T, A
---@param t T[]
---@param pred fun(val: T, arg: A): any
---@param arg A
---@return T[]
---@nodiscard
function tablex.filter(t, pred, arg) end

---filter an array's values using a predicate function
---@generic T
---@param t T[] -- a list-like table
---@param pred pl.BoolBinOpString -- a boolean function
---@param arg any -- optional argument to be passed as second argument of the predicate
---@return T[]
---@nodiscard
function tablex.filter(t, pred, arg) end

---@generic K, V
---@param t { [K]: V }
---@param fun fun(value: V, key: K, ...: any)
---@param ... any
function tablex.foreach(t, fun, ...) end

---apply a function to all elements of a table. The arguments to the function
---will be the value, the key and finally any extra arguments passed to this
---function. Note that the Lua 5.0 function `table.foreach` passed the key
---first.
---@param t table -- a table
---@param fun pl.OpString -- a function on the elements
---@param ... any -- extra arguments passed to `fun`
function tablex.foreach(t, fun, ...) end

---@generic T
---@param t T[]
---@param fun fun(value: T, index: integer, ...: any)
---@param ... any
function tablex.foreachi(t, fun, ...) end

---apply a function to all elements of a list-like table in order. The
---arguments to the function will be the value, the index and finally any extra
---arguments passed to this function.
---@param t any[] -- a table
---@param fun pl.OpString -- a function with at least one argument
---@param ... any -- optional arguments
function tablex.foreachi(t, fun, ...) end

---@generic K, V
---@param t { [K]: V }
---@param f? fun(key1: K, key2: K): boolean
---@return fun(): (K, V)
---@nodiscard
function tablex.sort(t, f) end

---return an iterator to a table sorted by its keys
---@generic K, V
---@param t { [K]: V } -- the table
---@param f? pl.BoolOrderedBinOpString -- an optional comparison function (`f(x, y)` is true if `x < y`)
---@return fun(): (K, V) -- an iterator to traverse elements sorted by the values
---@nodiscard
---
---Usage:
---
---```lua
---for k, v in tablex.sort(t) do print(k, v) end
---```
function tablex.sort(t, f) end

---@generic K, V
---@param t { [K]: V }
---@param f? fun(value1: V, value2: V): boolean
---@return fun(): (K, V)
---@nodiscard
function tablex.sortv(t, f) end

---return an iterator to a table sorted by its values
---@generic K, V
---@param t { [K]: V } -- the table
---@param f? pl.BoolOrderedBinOpString -- an optional comparison function (`f(x, y)` is true if `x < y`)
---@return fun(): (K, V) -- an iterator to traverse elements sorted by the values
---@nodiscard
---
---Usage:
---
---```lua
---for k, v in tablex.sortv(t) do print(k, v) end
---```
function tablex.sortv(t, f) end

---return all the keys of a table in arbitrary order.
---@generic K
---@param t { [K]: any } -- the table
---@return K[] -- A list-like table where the values are the keys of the input table
---@nodiscard
function tablex.keys(t) end

---return all the values of the table in arbitrary order
---@generic V
---@param t { [any]: V } -- the table
---@return V[] -- A list-like table where the values are the values of the input table
---@nodiscard
function tablex.values(t) end

---Extract a range from a table, like `string.sub`. If first or last are
---negative then they are relative to the end of the list eg. `sub(t,-2)` gives
---last 2 entries in a list, and `sub(t,-4,-2)` gives from -4th to -2nd
---@generic T
---@param t T[] -- a list-like table
---@param first integer -- An index
---@param last integer -- An index
---@return pl.List -- a new List
---@nodiscard
function tablex.sub(t, first, last) end

---combine two tables, either as union or intersection. Corresponds to set
---operations for sets but more general. Not particularly useful for list-like
---tables.
---@param t1 table -- a table
---@param t2 table -- a table
---@param dup? boolean -- `true` for a union, `false` for an intersection. (default `false`)
---@return table
---@nodiscard
---
---Usage:
---
---```lua
---merge({alice=23, fred=34}, {bob=25, fred=34}) == {fred=34}
---
---merge({alice=23, fred=34}, {bob=25, fred=34}, true) == {bob=25, fred=34, alice=23}
---```
function tablex.merge(t1, t2, dup) end

---a new table which is the difference of two tables. With sets (where the
---values are all true) this is set difference and symmetric difference
---depending on the third parameter.
---@param s1 table -- a map-like table or set
---@param s2 table -- a map-like table or set
---@param symm? boolean -- symmetric difference (default `false`)
---@return table -- a map-like table or set
---@nodiscard
function tablex.difference(s1, s2, symm) end

---return a table where each element is a table of the ith values of an
---arbitrary number of tables. It is equivalent to a matrix transpose.
---@param ... any[] -- arrays to be zipped
---@return any[][]
---@nodiscard
---
---Usage:
---
---```lua
---zip({10, 20, 30}, {100, 200, 300}) == {{10, 100}, {20, 200}, {30, 300}}
---```
function tablex.zip(...) end

return tablex

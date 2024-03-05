local class = require("pl.class")

---@meta
---# Class [`pl.Set`](https://lunarmodules.github.io/Penlight/classes/pl.Set.html)
---
---A Set class.
---
---```lua
---> Set = require 'pl.Set'
---> = Set{'one','two'} == Set{'two','one'}
---true
---> fruit = Set{'apple','banana','orange'}
---> = fruit['banana']
---true
---> = fruit['hazelnut']
---nil
---> colours = Set{'red','orange','green','blue'}
---> = fruit,colours
---[apple,orange,banana]   [blue,green,orange,red]
---> = fruit+colours
---[blue,green,apple,red,orange,banana]
---[orange]
---> more_fruits = fruit + 'apricot'
---> = fruit*colours
--- =  more_fruits, fruit
---banana,apricot,apple,orange]    [banana,apple,orange]
---```
---
---Dependencies:
---
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [`pl.tablex`](https://lunarmodules.github.io/Penlight/libraries/pl.tablex.html#),
--- [`pl.class`](https://lunarmodules.github.io/Penlight/libraries/pl.class.html#),
--- [`pl.Map`](https://lunarmodules.github.io/Penlight/classes/pl.Map.html#),
--- ([`pl.List`](https://lunarmodules.github.io/Penlight/classes/pl.List.html#) if `__tostring` is used)
---@class pl.Set.Class : pl.Map
---@overload fun(t?: any[]|pl.List|pl.Set|pl.Map): pl.Set
local Set = class()

---@class pl.Set
---@operator add(any): pl.Set
---@operator mul(pl.Set): pl.Set
---@operator sub(any): pl.Set
---@operator pow(pl.Set): pl.Set
---@operator len: integer

---create a set.
---@param self pl.Set
---@param t? any[]|pl.List|pl.Set|pl.Map -- may be a Set, Map or list-like table.
function Set:_init(t) end

---get a list of the values in a set.
---@param self pl.Set
---@return pl.List -- a list
---@nodiscard
function Set.values(self) end

---@param self pl.Set
---@param fn fun(val: any, ...: any): any
---@param ... any
---@return pl.Set
---@nodiscard
function Set.map(self, fn, ...) end

---map a function over the values of a set.
---@param self pl.Set
---@param fn pl.OpString -- a function
---@param ... any -- extra arguments to pass to the function.
---@return pl.Set -- a new set
---@nodiscard
function Set.map(self, fn, ...) end

---union of two sets (also `+`).
---@param self pl.Set
---@param set pl.Set -- another set
---@return pl.Set -- a new set
---@nodiscard
function Set.union(self, set) end

---intersection of two sets (also `*`).
---@param self pl.Set
---@param set pl.Set -- another set
---@return pl.Set -- a new set
---@nodiscard
---
---Usage:
---
---```lua
---> s = Set{10, 20, 30}
---> t = Set{20, 30, 40}
---> = t
---[20,30,40]
---> = Set.intersection(s, t)
---[30,20]
---> = s*t
---[30,20]
---```
function Set.intersection(self, set) end

---a new set with elements in *either* one set *or* other but not both (also `^`).
---@param self pl.Set
---@param set pl.Set -- another set
---@return pl.Set -- a new set
function Set.symmetric_difference(self, set) end

---new set with elements in the set that are not in the other (also `-`).
---@param self pl.Set
---@param set pl.Set -- another set
---@return pl.Set -- a new set
---@nodiscard
function Set.difference(self, set) end

---is the first set a subset of the second (also `<`)?
---@param self pl.Set
---@param set pl.Set -- another set
---@return boolean
---@nodiscard
function Set.issubset(self, set) end

---is the set empty?
---@param self pl.Set
---@return boolean
---@nodiscard
function Set.isempty(self) end

---are the sets disjoint (no elements in common)? Uses naive definition, i.e.
---that intersection is empty
---@param self pl.Set
---@param set pl.Set -- another set
---@return boolean
---@nodiscard
function Set.isdisjoint(self, set) end

---size of this set (also `#` for 5.2).
---@param self pl.Set
---@return integer size
---@nodiscard
function Set.len(self) end

---string representation of a set.
---@param self pl.Set
---@return string
---@nodiscard
function Set.__tostring(self) end

---union of sets.
---@param self pl.Set
---@param set pl.Set
---@return pl.Set
---@nodiscard
function Set.__add(self, set) end

---intersection of sets.
---@param self pl.Set
---@param set pl.Set
---@return pl.Set
---@nodiscard
function Set.__mul(self, set) end

---difference of sets.
---@param self pl.Set
---@param set pl.Set
---@return pl.Set
---@nodiscard
function Set.__sub(self, set) end

---symmetric difference of sets.
---@param self pl.Set
---@param set pl.Set
---@return pl.Set
---@nodiscard
function Set.__pow(self, set) end

---first set subset of second?
---@param self pl.Set
---@param set pl.Set
---@return boolean
---@nodiscard
function Set.__lt(self, set) end

---cardinality of set (5.2).
---@param self pl.Set
---@return integer
---@nodiscard
function Set.__len(self, set) end

---equality between sets.
---@param self pl.Set
---@param set pl.Set
---@return boolean
---@nodiscard
function Set.__eq(self, set) end

return Set

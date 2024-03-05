---@meta
---# Module [`pl.input`](https://lunarmodules.github.io/Penlight/libraries/pl.input.html)
---
---Iterators for extracting words or numbers from an input source.
---
---```lua
---require 'pl'
---local total, n = seq.sum(input.numbers())
---print('average',total/n)
---```
---
---*source* is defined as a string or a file-like object (i.e. has a read() method which returns the next line)
---
---See [here](https://lunarmodules.github.io/Penlight/manual/06-data.md.html#Reading_Unstructured_Text_Data)
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#)
local input = {}

---create an iterator over all tokens. based on `allwords()` from [PiL, 7.1](https://www.lua.org/pil/7.1.html)
---@param getter fun(): string -- any function that returns a line of text
---@param pattern string
---@param fn? string -- a function to process each token as it's found. (optional)
---@return fun(): string -- an iterator
---@nodiscard
---
---Usage:
---
---```lua
---for word in input.alltokens(io.read, "%w+") do
---  print("found word in input:", word)
---end
---```
function input.alltokens(getter, pattern, fn) end

---create a function which grabs the next value from a source. If the source
---is a string, then the getter will return the string and thereafter return
---nil. If not specified then the source is assumed to be stdin.
---@generic T: string
---@param f string|file* -- string or a file-like object (i.e. has a read() method which returns the next line)
---@return fun(): T -- a getter function
---@nodiscard
function input.create_getter(f) end

---generate a sequence of numbers from a source.
---@param f string|file* -- a source
---@return fun(): number -- an iterator
---@nodiscard
function input.numbers(f) end

---generate a sequence of words from a source.
---@param f string|file* -- a source
---@return fun(): string -- an iterator
---@nodiscard
function input.words(f) end

---@class pl.InputFieldsOptions
---@field no_fail boolean -- default `true`
---@field no_convert boolean -- default `false`

---parse an input source into fields. By default, will fail if it cannot
---convert a field to a number.
---@param ids integer[]|integer -- a list of field indices, or a maximum field index
---@param delim? string -- delimiter to parse fields (default space)
---@param f? string|file* -- a source (default stdin)
---@param opts? pl.InputFieldsOptions -- an option table, (default `{no_fail=true, no_convert=false}`)
---@return fun(): ...: string -- an iterator with the field values
---@nodiscard
---
---Usage:
---
---```lua
---for x,y in fields {2,3} do print(x,y) end -- 2nd and 3rd fields from stdin
---```
function input.fields(ids, delim, f, opts) end

return input

---@meta
---# Module [`pl.data`](https://lunarmodules.github.io/Penlight/libraries/pl.data.html)
---
---Reading and querying simple tabular data.
---
---```lua
---data.read 'test.txt'
---==> {{10,20},{2,5},{40,50},fieldnames={'x','y'},delim=','}
---```
---
---Provides a way of creating basic SQL-like queries.
---
---```lua
---require 'pl'
---local d = data.read('xyz.txt')
---local q = d:select('x,y,z where x > 3 and z < 2 sort by y')
---for x,y,z in q do
---    print(x,y,z)
---end
---```
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/06-data.md.html#Reading_Columnar_Data)
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [`pl.array2d`](https://lunarmodules.github.io/Penlight/libraries/pl.array2d.html) (fallback methods)
local data = {}

---@class pl.Data
local prototype_Data = {}

---return a particular column as a list of values (method).
---@param name string|integer -- either name of column, or numerical index.
---@nodiscard
function prototype_Data:column_by_name(name) end

---return a query iterator on this data (method).
---@param condn string -- the query expression
---@return fun(): ...
---@nodiscard
function prototype_Data:select(condn) end

---return a row iterator on this data (method).
---@param condn string -- the query expression
---@return fun(): ...
---@nodiscard
function prototype_Data:select_row(condn) end

---return a new data object based on this query (method).
---@param condn string -- the query expression
---@return pl.Data
---@nodiscard
function prototype_Data:copy_select(condn) end

---return the field names of this data object (method).
---@return string[]
---@nodiscard
function prototype_Data:column_names() end

---write out a row (method).
---@param f file* -- file-like object
---@param row any[]
function prototype_Data:write_row(f, row) end

---write data out to file (method).
---@param f file* -- file-like object
function prototype_Data:write(f) end

---@class pl.Data.ReadConfig
---@field delim string -- a string pattern to split fields
---@field fieldnames string[] -- (i.e. don't read from first line)
---@field no_convert boolean -- (default is to try conversion on first data line)
---@field convert { [string]: (fun(value: string): any?, string?) } -- table of custom conversion functions with column keys
---@field numfields integer -- indices of columns known to be numbers
---@field last_field_collect boolean -- only split as many fields as fieldnames.
---@field thousands_dot integer -- thousands separator in Excel CSV is '.'
---@field csv boolean -- fields may be double-quoted and contain commas; Also, empty fields are considered to be equivalent to zero.

---@param file string|file* -- a filename or a file-like object
---@param cnfg pl.Data.ReadConfig -- parsing options. See `DataReadConfig` type for more info
---@return pl.Data? -- data object, or `nil`
---@return string? -- error message. May be a file error, 'not a file-like object' or a conversion error
---@nodiscard
function data.read(file, cnfg) end

---write 2D data to a file. Does not assume that the data has actually been
---generated with `data.new` or `data.read`.
---@param d any[][] -- 2D array
---@param file string|file* -- filename or file-like object
---@param fieldnames? string[] -- list of fields (optional)
---@param delim? string -- delimiter (default '\t')
---@return true|nil
---@return string? -- error
function data.write(d, file, fieldnames, delim) end

---@class pl.Data.Options
---@field [integer] any[]
---@field fieldnames string|string[]? -- a string of delimiter-separated names, or a table of names
---@field delim string? -- delimiter (default `fieldnames`'s delimiter' or '\t')

---create a new dataset from a table of rows. Can specify the fieldnames, else
---the table must have a field called 'fieldnames', which is either a string
---of delimiter-separated names, or a table of names.
---If the table does not have a field called 'delim', then an attempt will be
---made to guess it from the fieldnames string, defaults otherwise to tab.
---@param d pl.Data.Options -- the table.
---@param fieldnames? string[] -- fieldnames (default `d.fieldnames`)
---@nodiscard
function data.new(d, fieldnames) end

---@class pl.Data.QueryArg
---@field fields string|string[]
---@field sort_by string
---@field where string|(fun(v: any): boolean)

---create a query iterator from a select string. Select string has this format:
---
---```plain
---FIELDLIST [ where LUA-CONDN [ sort by FIELD] ]
---FIELDLIST is a comma-separated list of valid fields, or '*'.
---```
---
---@param d pl.Data -- table produced by `data.read`
---@param condn string|string[] -- select string or table
---@param context? {[string]: any}[] -- a list of tables to be searched when resolving functions
---@param return_row? boolean -- if true, wrap the results in a row table
---@return (fun(): ...)? -- an iterator over specified fields, or `nil`
---@return string? -- an error message
---@nodiscard
function data.query(d, condn, context, return_row) end

---Filter input using a query.
---@param Q string -- a query string
---@param infile? string|file* -- filename or file-like object (default stdin)
---@param outfile? string|file* -- filename or file-like object (default stdout)
---@param dont_fail boolean -- true if you want to return an error, not just fail
function data.filter(Q, infile, outfile, dont_fail) end

return data

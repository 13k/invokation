---@meta
---# Module [`pl.app`](https://lunarmodules.github.io/Penlight/libraries/pl.app.html)
---
---Application support functions.
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/01-introduction.md.html#Application_Support).
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html),
--- [`pl.path`](https://lunarmodules.github.io/Penlight/libraries/pl.path.html)
local app = {}

---Return the name of the current script running.
---The name will be the name as passed on the command line
---@return string -- filename
---@nodiscard
function app.script_name() end

---Prefixes the current script's path to the Lua module path. Applies to both
---the source and the binary module paths. It makes it easy for the main file
---of a multi-file program to access its modules in the same directory. base
---allows these modules to be put in a specified subdirectory, to allow for
---cleaner deployment and resolve potential conflicts between a script name
---and its library directory.
---
---Note: the path is prefixed, so it is searched first when requiring modules.
---@param base string -- optional base directory (absolute, or relative path).
---@param nofollow boolean -- always use the invocation's directory, even if the invoked file is a symlink
---@return string -- the current script's path with a trailing slash
function app.require_here(base, nofollow) end

---Return a suitable path for files private to this application. These will
---look like '\~/.SNAME/file', with '\~' as with expanduser and SNAME is the
---name of the script without .lua extension. If the directory does not exist,
---it will be created.
---@param file string -- a filename (w/out path)
---@return string? -- a full pathname, or nil
---@return string? -- cannot create directory error
---@nodiscard
---
---Usage:
---
---```lua
----- when run from a script called 'testapp' (on Windows):
---local app = require 'pl.app'
---print(app.appfile 'test.txt')
----- C:\Documents and Settings\steve\.testapp\test.txt
---```
function app.appfile(file) end

---Return string indicating operating system.
---@return string -- \'Windows', 'OSX' whatever uname returns (e.g. 'Linux')
---@nodiscard
function app.platform() end

---Return the full command-line used to invoke this script. It will not
---include the scriptname itself.
---@see app.script_name
---@return string -- command-line
---@return string -- name of Lua program used
---@nodiscard
---
---Usage:
---
---```lua
----- execute:  lua -lluacov -e 'print(_VERSION)' myscript.lua
---
----- myscript.lua
---print(require("pl.app").lua())  --> "lua -lluacov -e 'print(_VERSION)'", "lua"
---```
function app.lua() end

---parse command-line arguments into flags and parameters. Understands
---GNU-style command-line flags; short (-f) and long (--flag).
---
---These may be given a value with either '=' or ':' (-k:2,--alpha=3.2,-n2), a
---number value can be given without a space. If the flag is marked as having
---a value, then a space-separated value is also accepted (-i hello), see the
---flags_with_values argument.
---
---Multiple short args can be combined like so: ( -abcd).
---
---When specifying the flags_valid parameter, its contents can also contain
---aliasses, to convert short/long flags to the same output name. See the
---example below.
---
---Note: if a flag is repeated, the last value wins.
---@param args string[] -- an array of strings (default is the global `arg`).
---@param flags_with_values table -- any flags that take values, either list or hash table e.g. `{ out=true }` or `{ "out" }`.
---@param flags_valid table -- flags that are valid, either list or hashtable. If not given, everything will be accepted(everything in flags_with_values will automatically be allowed).
---@return table -- a table of flags (flag=value pairs)
---@return table -- an array of parameters
---@nodiscard
---
---Usage:
---
---```lua
----- Simple form:
---local flags, params = app.parse_args(nil,
---  { "hello", "world" },  -- list of flags taking values
---  { "l", "a", "b"})      -- list of allowed flags (value ones will be added)
---
----- More complex example using aliasses:
---local valid = {
---  long = "l",           -- if 'l' is specified, it is reported as 'long'
---  new = { "n", "old" }, -- here both 'n' and 'old' will go into 'new'
---}
---local values = {
---  "value",   -- will automatically be added to the allowed set of flags
---  "new",     -- will mark 'n' and 'old' as requiring a value as well
---}
---local flags, params = app.parse_args(nil, values, valid)
---
----- command:  myapp.lua -l --old:hello --value world param1 param2
----- will yield:
---flags = {
---  long = true,     -- input from 'l'
---  new = "hello",   -- input from 'old'
---  value = "world", -- allowed because it was in 'values', note: space separated!
---}
---params = {
---  [1] = "param1"
---  [2] = "param2"
---}
---```
function app.parse_args(args, flags_with_values, flags_valid) end

return app

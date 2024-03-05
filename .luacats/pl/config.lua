---@meta
---# Module [`pl.config`](https://lunarmodules.github.io/Penlight/libraries/pl.config.html)
---
---Reads configuration files into a Lua table.
---
---Understands INI files, classic Unix config files, and simple delimited
---columns of values. See [the Guide](https://lunarmodules.github.io/Penlight/manual/06-data.md.html#Reading_Configuration_Files)
---
---`test.config`
---
---```ini
---# Read timeout in seconds
---read.timeout=10
---# Write timeout in seconds
---write.timeout=5
---#acceptable ports
---ports = 1002,1003,1004
---```
---
---`readconfig.lua`
---
---```lua
---local config = require 'config'
---local t = config.read 'test.config'
---print(pretty.write(t))
---
----- output
---{
---  ports = {
---    1002,
---    1003,
---    1004
---  },
---  write_timeout = 5,
---  read_timeout = 10
---}
---```
local config = {}

---like `io.lines()`, but allows for lines to be continued with `"`.
---@param file { read: fun(): string } -- a file-like object (anything where read() returns the next line) or a filename. Defaults to stardard input.
---@return (fun(): string)? -- an iterator over the lines, or `nil`
---@return string? -- error 'not a file-like object' or 'file is nil'
---@nodiscard
function config.lines(file) end

---a configuration table for the `config.read` function
---@class pl.ConfigReadConfig
---@field smart boolean? -- try to deduce what kind of config file we have (default false)
---@field variabilize boolean? -- make names into valid Lua identifiers (default true)
---@field convert_numbers boolean? -- try to convert values into numbers (default true)
---@field trim_space boolean? -- ensure that there is no starting or trailing whitespace with values (default true)
---@field trim_quotes boolean? -- remove quotes from strings (default false)
---@field list_delim string? -- delimiter to use when separating columns (default ',')
---@field keysep string? -- separator between key and value pairs (default '=')

---read a configuration file into a table
---@param file string|file* -- either a file-like object or a string, which must be a filename
---@param cnfg? pl.ConfigReadConfig -- see `ConfigReadConfig` type for more info (optional)
---@return table? -- a table containing items, or `nil`
---@return string? -- error 'not a file-like object' or 'file is nil'
---@nodiscard
function config.read(file, cnfg) end

return config

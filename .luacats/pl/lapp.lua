---@meta
---# Module [`pl.lapp`](https://lunarmodules.github.io/Penlight/libraries/pl.lapp.html)
---
---Simple command-line parsing using human-readable specification.
---
---Supports GNU-style parameters.
---
---```lua
---lapp = require 'pl.lapp'
---local args = lapp [[
---Does some calculations
---  -o,--offset (default 0.0)  Offset to add to scaled number
---  -s,--scale  (number)  Scaling factor
---  <number> (number) Number to be scaled
---]]
---
---print(args.offset + args.scale * args.number)
---```
---
---Lines beginning with '-' are flags; there may be a short and a long name;
---lines  beginning with '<var>' are arguments. Anything in parens after the
---flag/argument is either a default, a type name or a range constraint.
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/08-additional.md.html#Command_line_Programs_with_Lapp)
---
---Dependencies:
--- [`pl.sip`](https://lunarmodules.github.io/Penlight/libraries/pl.sip.html#)
---@overload fun(str: string, args?: string[]): { [string]: string }
local lapp = {
	---controls whether to dump usage on error. Defaults to `true`
	show_usage_error = true,--[[@as boolean]]
}

---quit this script immediately.
---@param msg? string -- optional message
---@param no_usage? boolean|"throw" -- suppress 'usage' display or error
function lapp.quit(msg, no_usage) end

--- print an error to stderr and quit.
---@param msg string -- a message
---@param no_usage? boolean|"throw" -- suppress 'usage' display
function lapp.error(msg, no_usage) end

---open a file. This will quit on error, and keep a list of file objects for
---later cleanup.
---@param file string -- filename
---@param opt? openmode -- same as second parameter of io.open
---@return file*
---@nodiscard
function lapp.open(file, opt) end

---quit if the condition is false.
---@param condn boolean -- a condition
---@param msg string -- message text
function lapp.assert(condn, msg) end

---add a new type to Lapp. These appear in parens after the value like a range
---constraint, e.g. ' (integer) Process PID'
---@param name string -- name of type
---@param converter (fun(val: string): string)|string -- either a function to convert values, or a Lua type name.
---@param constraint? fun(val: string) -- function to verify values, should use `lapp.error` if failed
function lapp.add_type(name, converter, constraint) end

---process a Lapp options string. Usually called as `lapp()`.
---@param str string -- the options text
---@param args? string[] -- a table of arguments (default is _G.arg)
---@return { [string]: string } -- a table with parameter-value pairs
---@nodiscard
function lapp.process_options_string(str, args) end

return lapp

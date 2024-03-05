---@meta
---# Module [`pl.sip`](https://lunarmodules.github.io/Penlight/libraries/pl.sip.html)
---
---Simple Input Patterns (SIP).
---
---SIP patterns start with '$', then a one-letter type, and then an optional variable in curly braces.
---
---```lua
---sip.match('$v=$q','name="dolly"',res)
---==> res=={'name','dolly'}
---sip.match('($q{first},$q{second})','("john","smith")',res)
---==> res=={second='smith',first='john'}
---```
---
---Type names:
---
---```lua
---v     identifier
---i     integer
---f     floating-point
---q     quoted string
---([{<  match up to closing bracket
---```
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/08-additional.md.html#Simple_Input_Patterns)
local sip = {}

---@alias pl.SipOptions { at_start: boolean? }

---convert a SIP pattern into the equivalent Lua string pattern.
---@param spec string -- a SIP pattern
---@param options pl.SipOptions -- a table; only the `at_start` field is currently meaningful and ensures that the pattern is anchored at the start of the string.
---@return string -- a Lua string pattern.
---@nodiscard
function sip.create_pattern(spec, options) end

---convert a SIP pattern into a matching function. The returned function takes
---two arguments, the line and an empty table. If the line matched the pattern,
---then this function returns true and the table is filled with field-value
---pairs.
---@param spec string -- a SIP pattern
---@param options pl.SipOptions -- a table; only the `at_start` field is currently meaningful and ensures that the pattern is anchored at the start of the string.
---@return (fun(line: string, res: table): boolean)? -- a function if successful, or nil on error
---@return string? -- nil if successful, or an error message
---@nodiscard
function sip.compile(spec, options) end

---match a SIP pattern against a string.
---@param spec string -- a SIP pattern
---@param line string -- a string
---@param res table -- a table to receive values
---@param options pl.SipOptions -- option table
---@return boolean
---@nodiscard
function sip.match(spec, line, res, options) end

---match a SIP pattern against the start of a string.
---@param spec string -- a SIP pattern
---@param line string -- a string
---@param res table -- a table to receive values
---@return boolean
---@nodiscard
function sip.match_at_start(spec, line, res) end

---given a pattern and a file object, return an iterator over the results
---@param spec string -- a SIP pattern
---@param f file* -- a file-like object
---@return fun(): (...: string)
---@nodiscard
function sip.fields(spec, f) end

---register a match which will be used in the `sip.read` function.
---@param spec string -- a SIP pattern
---@param fun function -- a function to be called with the results of the match
function sip.pattern(spec, fun) end

---enter a loop which applies all registered matches to the input file.
---@param f file* -- a file-like object
---@param matches ({[1]: string, [2]: fun(...: string)}|{[1]: string, [2]: fun(matches: {[string]: string })})[] -- optional list of {spec,fun} pairs, as for pattern above.
function sip.read(f, matches) end

return sip

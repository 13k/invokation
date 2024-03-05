---@meta
---# Module [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html)
---
---Generally useful routines.
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/01-introduction.md.html#Generally_useful_functions_).
---
---Dependencies:
--- [`pl.compat`](https://lunarmodules.github.io/Penlight/libraries/pl.compat.html#),
--- all exported fields and functions from [`pl.compat`](https://lunarmodules.github.io/Penlight/libraries/pl.compat.html#) are also available in this module.
local utils = {}

---pack an argument list into a table.
---@param ... any -- any arguments
---@return { n: integer, [integer]: any } -- a table with field `n` set to the length
---@nodiscard
function utils.pack(...) end

---unpack a table and return its contents.
---
---NOTE: this implementation differs from the Lua implementation in the way
---that this one DOES honor the `n` field in the table t, such that it is 'nil-safe'.
---@param t table -- table to unpack
---@param i? integer -- index from which to start unpacking, defaults to `1`
---@param j? integer -- index of the last element to unpack, defaults to `t.n` or else `#t`
---@return any ... -- multiple return values from the table
---@nodiscard
---
---Usage:
---
---```lua
---local t = table.pack(nil, nil, nil, 4)
---local a, b, c, d = table.unpack(t)   -- this unpack is NOT nil-safe, so d == nil
---
---local a, b, c, d = utils.unpack(t)   -- this is nil-safe, so d == 4
---```
function utils.unpack(t, i, j) end

---print an arbitrary number of arguments using a format. Output will be sent to `stdout`.
---@param fmt string -- The format (see [`string.format`](https://www.lua.org/manual/5.1/manual.html#pdf-string.format))
---@param ... any -- Extra arguments for format
function utils.printf(fmt, ...) end

---write an arbitrary number of arguments to a file using a format.
---@param f file* -- File handle to write to.
---@param fmt string -- The format (see [`string.format`](https://www.lua.org/manual/5.1/manual.html#pdf-string.format))
---@param ... any -- Extra arguments for format
function utils.fprintf(f, fmt, ...) end

---take a table and 'inject' it into the local namespace.
---@param t table|string -- The table (table), or module name (string), defaults to this `utils` module table
---@param T table -- An optional destination table (defaults to caller's environment)
function utils.import(t, T) end

---return either of two values, depending on a condition.
---@param cond any -- A condition
---@param value1 any -- Value returned if `cond` is truthy
---@param value2 any -- Value returned if `cond` is falsy
---@return any
---@nodiscard
function utils.choose(cond, value1, value2) end

---convert an array of values to strings.
---@param t any[] -- a list-like table
---@param temp? table -- buffer to use, otherwise allocate
---@param tostr? fun(value: any, index: integer): string -- custom `tostring` function, called with `(value, index)`. Defaults to [`tostring`](https://www.lua.org/manual/5.1/manual.html#pdf-tostring).
---@return string
---@nodiscard
---@nodiscard
function utils.array_tostring(t, temp, tostr) end

---is the object of the specified type? If the type is a string, then use type,
---otherwise compare with metatable
---@param obj any -- An object to check
---@param tp string|table -- String or metatable of what type it should be
---@return boolean
---@nodiscard
---
---Usage:
---
---```lua
---utils.is_type("hello world", "string")   --> true
---
----- or check metatable
---local my_mt = {}
---local my_obj = setmetatable(my_obj, my_mt)
---utils.is_type(my_obj, my_mt)  --> true
---```
function utils.is_type(obj, tp) end

---an iterator with indices, similar to [`ipairs`](https://www.lua.org/manual/5.1/manual.html#pdf-ipairs),
---but with a range. This is a nil-safe index based iterator that will return
---`nil` when there is a hole in a list. To be safe ensure that table `t.n`
---contains the length.
---@param t table -- the table to iterate over
---@param i_start? integer -- start index (default `1`)
---@param i_end? integer -- end index (default `t.n` or `#t`)
---@param step? integer -- step size (default `1`)
---@return fun(): (index: integer, value: any) -- index and value at index (which can be `nil`!)
---@nodiscard
---
---Usage:
---
---```lua
---local t = utils.pack(nil, 123, nil)  -- adds an n field when packing
---
---for i, v in utils.npairs(t, 2) do  -- start at index 2
---  t[i] = tostring(t[i])
---end
---
----- t = { n = 3, [2] = "123", [3] = "nil" }
---```
function utils.npairs(t, i_start, i_end, step) end

---an iterator over all non-integer keys (inverse of [`ipairs`](https://www.lua.org/manual/5.1/manual.html#pdf-ipairs)
---). It will skip any key that is an integer number, so negative indices or an
---array with holes will not return those either (so it returns slightly less
---than 'the inverse of [ipairs](https://www.lua.org/manual/5.1/manual.html#pdf-ipairs)'
---).
---
---This uses [`pairs`](https://www.lua.org/manual/5.1/manual.html#pdf-pairs)
---under the hood, so any value that is iterable using [`pairs`](https://www.lua.org/manual/5.1/manual.html#pdf-pairs)
---will work with this function.
---@param t table -- the table to iterate over
---@return fun(): (key: any, value: any)
---@nodiscard
---
---Usage:
---
---```lua
---local t = {
---  "hello",
---  "world",
---  hello = "hallo",
---  world = "Welt",
---}
---
---for k, v in utils.kpairs(t) do
---  print("German: ", v)
---end
---
----- output;
----- German: hallo
----- German: Welt
---```
function utils.kpairs(t) end

---Some standard patterns
utils.patterns = {
	---floating point number
	FLOAT = "[%+%-%d]%d*%.?%d*[eE]?[%+%-]?%d*",

	---integer number
	INTEGER = "[+%-%d]%d*",

	---identifier
	IDEN = "[%a_][%w_]*",

	-- note that I use '\\\\' here for documentation accuracy

	---file
	FILE = "[%a%.\\\\][:%][%w%._%-\\\\]*",
}

---Standard meta-tables as used by other Penlight modules
utils.stdmt = {
	---the `List` metatable
	List = { _name = "List" },

	---the `Map` metatable
	Map = { _name = "Map" },

	---the `Set` metatable
	Set = { _name = "Set" },

	---the `MultiMap` metatable
	MultiMap = { _name = "MultiMap" },
}

---assert that the given argument is in fact of the correct type.
---@param n integer -- argument index
---@param val any -- the value
---@param tp type -- the type
---@param verify? fun(val: any): boolean -- an optional verification function
---@param msg? string -- an optional custom message
---@param lev? integer -- optional stack position for trace (default `2`)
---@return any val -- the validated value
---
---Raises: if `val` is not the correct type
---
---Usage:
---
---```lua
---local param1 = assert_arg(1,"hello",'table')  --> error: argument 1 expected a 'table', got a 'string'
---local param4 = assert_arg(4,'!@#$%^&*','string',path.isdir,'not a directory')
---     --> error: argument 4: '!@#$%^&*' not a directory
---```
function utils.assert_arg(n, val, tp, verify, msg, lev) end

---creates an Enum or constants lookup table for improved error handling. This
---helps prevent magic strings in code by throwing errors for accessing
---non-existing values, and/or converting strings/identifiers to other values.
---
---Calling on the object does the same, but returns a soft error; `nil + err`, if
---the call is successful (the key exists), it will return the value.
---
---When calling with varargs or an array the values will be equal to the keys.
---The enum object is read-only.
---@param ... any -- the input for the Enum. If `...` or an array then the values in the Enum will be equal to the names (must be strings), if a hash-table then values remain (any type), and the keys must be strings.
---@return table enum_object -- Enum object (read-only table/object)
---@nodiscard
---
---Usage:
---
---```lua
----- Enum access at runtime
---local obj = {}
---obj.MOVEMENT = utils.enum("FORWARD", "REVERSE", "LEFT", "RIGHT")
---
---if current_movement == obj.MOVEMENT.FORWARD then
---  -- do something
---
---elseif current_movement == obj.MOVEMENT.REVERES then
---  -- throws error due to typo 'REVERES', so a silent mistake becomes a hard error
---  -- "'REVERES' is not a valid value (expected one of: 'FORWARD', 'REVERSE', 'LEFT', 'RIGHT')"
---
---end
---
---
---
----- standardized error codes
---local obj = {
---  ERR = utils.enum {
---    NOT_FOUND = "the item was not found",
---    OUT_OF_BOUNDS = "the index is outside the allowed range"
---  },
---
---  some_method = function(self)
---    return self.ERR.OUT_OF_BOUNDS
---  end,
---}
---
---local result, err = obj:some_method()
---if not result then
---  if err == obj.ERR.NOT_FOUND then
---    -- check on error code, not magic strings
---
---  else
---    -- return the error description, contained in the constant
---    return nil, "error: "..err  -- "error: the index is outside the allowed range"
---  end
---end
---
---
---
----- validating/converting user-input
---local color = "purple"
---local ansi_colors = utils.enum {
---  black     = 30,
---  red       = 31,
---  green     = 32,
---}
---local color_code, err = ansi_colors(color) -- calling on the object, returns the value from the enum
---if not color_code then
---  print("bad 'color', " .. err)
---  -- "bad 'color', 'purple' is not a valid value (expected one of: 'black', 'red', 'green')"
---  os.exit(1)
---end
---```
function utils.enum(...) end

---process a function argument. This is used throughout Penlight and defines
---what is meant by a function: Something that is callable, or an operator
---string as defined by `pl.operator`, such as `'>'` or `'#'`. If a function factory
---has been registered for the type, it will be called to get the function.
---@param idx integer -- argument index
---@param f function|table|userdata -- a function, operator string, or callable object
---@param msg? string -- optional error message
---@return function -- a callable
---
---Raises: if `idx` is not a number or if `f` is not callable
---
function utils.function_arg(idx, f, msg) end

---@param idx integer
---@param f pl.OpString
---@param msg? string
---@return function
function utils.function_arg(idx, f, msg) end

---assert the common case that the argument is a string.
---@param n integer -- argument index
---@param val string -- a value that must be a string
---@return string val -- the validated value
---
---Raises: `val` must be a string
---
---Usage:
---
---```lua
---local val = 42
---local param2 = utils.assert_string(2, val) --> error: argument 2 expected a 'string', got a 'number'
---```
function utils.assert_string(n, val) end

---control the error strategy used by Penlight. This is a global setting that
---controls how `utils.raise` behaves:
---
--- * `'default'`: return `nil + error` (this is the default)
--- * `'error'`: throw a Lua error
--- * `'exit'`: exit the program
---
---@param mode "default"|"quit"|"error" -- either `'default'`, `'quit'` or `'error'`
function utils.on_error(mode) end

---used by Penlight functions to return errors. Its global behaviour is
---controlled by `utils.on_error`. To use this function you MUST use it in
---conjunction with `return`, since it might return `nil + error`.
---@param err string -- the error string.
---@return nil, string
---@nodiscard
---
---Usage:
---
---```lua
---if some_condition then
---  return utils.raise("some condition was not met")  -- MUST use 'return'!
---end
---```
function utils.raise(err) end

---return the contents of a file as a string
---@param filename string -- The file path
---@param is_bin? boolean -- open in binary mode (default `false`)
---@return string file_contents
---@nodiscard
function utils.readfile(filename, is_bin) end

---write a string to a file
---@param filename string -- The file path
---@param str string -- The string
---@param is_bin boolean? -- open in binary mode
---@return boolean? ok -- `true` or `nil`
---@return string? err_msg -- error message
---
---Raises: error if `filename` or `str` aren't strings
function utils.writefile(filename, str, is_bin) end

---return the contents of a file as a list of lines
---@param filename string -- The file path
---@return string[] -- file contents as a table
---@nodiscard
---
---Raises: error if `filename` is not a string
function utils.readlines(filename) end

---execute a shell command and return the output. This function redirects the
---output to tempfiles and returns the content of those files.
---@param cmd string -- a shell command
---@param bin? boolean -- if `true`, read output as binary file
---@return boolean? ok -- `true` if successful
---@return integer return_code -- actual return code
---@return string stdout -- stdout output
---@return string stderr -- stderr output
function utils.executeex(cmd, bin) end

---Quote and escape an argument of a command. Quotes a single (or list of)
---argument(s) of a command to be passed to [`os.execute`](https://www.lua.org/manual/5.1/manual.html#pdf-os.execute),
---`pl.utils.execute` or `pl.utils.executeex`.
---@param argument string|string[] -- the argument to quote. If a list then all arguments in the list will be returned as a single string quoted.
---@return string -- quoted and escaped argument.
---@nodiscard
---
---Usage:
---
---```lua
---local options = utils.quote_arg {
---	"-lluacov",
---	"-e",
---	"utils = print(require('pl.utils')._VERSION",
---}
----- returns: -lluacov -e 'utils = print(require('\''pl.utils'\'')._VERSION'
---```
function utils.quote_arg(argument) end

---error out of this program gracefully.
---@param code integer -- The exit code, defaults to `-1` if omitted
---@param msg string -- The exit message will be sent to `stderr` (will be formatted with extra parameters)
---@param ... any -- extra arguments for message's format
---
---Usage:
---
---```lua
---utils.quit(-1, "Error '%s' happened", "42")
----- is equivalent to
---utils.quit("Error '%s' happened", "42")  --> Error '42' happened
---```
function utils.quit(code, msg, ...) end

---escape any Lua 'magic' characters in a string
---@param s string -- The input string
---@return string
---@nodiscard
function utils.escape(s) end

---split a string into a list of strings separated by a delimiter.
---@param s string -- The input string
---@param re? string -- optional A Lua string pattern; defaults to '%s+'
---@param plain? boolean -- optional If truthy don't use Lua patterns
---@param n? integer -- optional maximum number of elements (if there are more, the last will remain un-split)
---@return string[] -- a list-like table
---@nodiscard
---
---Raises: error if `s` is not a string
function utils.split(s, re, plain, n) end

---split a string into a number of return values. Identical to `utils.split`
---but returns multiple sub-strings instead of a single list of sub-strings.
---@param s string -- the string
---@param re? string -- A Lua string pattern; defaults to '%s+'
---@param plain? boolean -- don't use Lua patterns
---@param n? integer -- optional maximum number of splits
---@return string ... -- `n` values
---@nodiscard
---
---Usage:
---
---```lua
---first, next = splitv('user=jane=doe', '=', false, 2)
---assert(first == "user")
---assert(next == "jane=doe")
---```
function utils.splitv(s, re, plain, n) end

---'memoize' a function (cache returned value for next call). This is useful if
---you have a function which is relatively expensive, but you don't know in
---advance what values will be required, so building a table upfront is
---wasteful/impossible.
---@generic K, R
---@param func fun(val: K): R -- a function of at least one argument
---@return fun(val: K): R -- a function with at least one argument, which is used as the key.
---@nodiscard
function utils.memoize(func) end

---associate a function factory with a type. A function factory takes an object
---of the given type and returns a function for evaluating it
---@param mt table -- metatable
---@param fun function -- a callable that returns a function
function utils.add_function_factory(mt, fun) end

---an anonymous function as a string. This string is either of the form
---`'|args| expression'` or is a function of one argument, `'_'`
---@param lf string -- function as a string
---@return function -- a function
---@nodiscard
---
---Usage:
---
---```lua
---string_lambda '|x|x+1' (2) == 3
---string_lambda '_+1' (2) == 3
---```
function utils.string_lambda(lf) end

---@generic P, X
---@param fn fun(p: P, x: X, ...: any)
---@param p P
---@return fun(x: X, ...: any) f
---@nodiscard
function utils.bind1(fn, p) end

---bind the first argument of the function to a value.
---@param fn pl.BinOpString -- a function of at least two values (may be an operator string)
---@param p any -- a value
---@return fun(x: any, ...: any) f -- a function such that `f(x) == fn(p, x)`
---@nodiscard
---
---Raises: if `f` is not callable
---
---Usage:
---
---```lua
---local function f(msg, name)
---  print(msg .. " " .. name)
---end
---
---local hello = utils.bind1(f, "Hello")
---
---print(hello("world"))     --> "Hello world"
---print(hello("sunshine"))  --> "Hello sunshine"
---```
function utils.bind1(fn, p) end

---@generic P, X
---@param fn fun(x: X, p: P, ...: any)
---@param p P
---@return fun(x: X, ...: any) f
---@nodiscard
function utils.bind2(fn, p) end

---bind the second argument of the function to a value.
---@param fn pl.BinOpString -- a function of at least two values (may be an operator string)
---@param p any -- a value
---@return fun(x: any, ...: any) f
---@nodiscard
---
---Raises: if `f` is not callable
function utils.bind2(fn, p) end

---Sets a deprecation warning function. An application can override this
---function to support proper output of deprecation warnings. The warnings can
---be generated from libraries or functions by calling
---`utils.raise_deprecation`. The default function will write to the 'warn'
---system (introduced in Lua 5.4, or the compatibility function from the
---compat module for earlier versions).
---
---Note: only applications should set/change this function, libraries should not.
---@param func? fun(msg: string, trace?: string) -- a callback with signature: `function(msg, trace)` both arguments are strings, the latter being optional.
---
---Usage:
---
---```lua
----- write to the Nginx logs with OpenResty
---utils.set_deprecation_func(function(msg, trace)
---  ngx.log(ngx.WARN, msg, (trace and (" " .. trace) or nil))
---end)
---
----- disable deprecation warnings
---utils.set_deprecation_func()
---```
function utils.set_deprecation_func(func) end

---@class pl.DeprecationOptions : table
---@field source? string
---@field message string
---@field version_removed? string
---@field deprecated_after? string
---@field no_trace? boolean

---raises a deprecation warning. For options see the usage example below.
---
---Note: the `opts.deprecated_after` field is the last version in which a
---feature or option was NOT YET deprecated! Because when writing the code it
---is quite often not known in what version the code will land. But the last
---released version is usually known.
---@param opts pl.DeprecationOptions -- options table
---
---Usage:
---
---```lua
---warn("@on")   -- enable Lua warnings, they are usually off by default
---
---function stringx.islower(str)
---  raise_deprecation {
---    source = "Penlight " .. utils._VERSION,                   -- optional
---    message = "function 'islower' was renamed to 'is_lower'", -- required
---    version_removed = "2.0.0",                                -- optional
---    deprecated_after = "1.2.3",                               -- optional
---    no_trace = true,                                          -- optional
---  }
---  return stringx.is_lower(str)
---end
----- output: "[Penlight 1.9.2] function 'islower' was renamed to 'is_lower' (deprecated after 1.2.3, scheduled for removal in 2.0.0)"
---```
function utils.raise_deprecation(opts) end

return utils

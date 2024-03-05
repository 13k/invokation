---@meta
---# Module [`pl.compat`](https://lunarmodules.github.io/Penlight/libraries/pl.compat.html)
---
---Lua 5.1/5.2/5.3 compatibility.
---
---Injects `table.pack`, `table.unpack`, and `package.searchpath` in the global
---environment, to make sure they are available for Lua 5.1 and LuaJIT.
---
---All other functions are exported as usual in the returned module table.
---
---NOTE: everything in this module is also available in pl.utils.
local compat = {

	---boolean flag this is Lua 5.1 (or LuaJIT).
	lua51 = _VERSION == "Lua 5.1",

	---boolean flag this is LuaJIT.
	jit = (tostring(assert):match("builtin") ~= nil),

	---boolean flag this is LuaJIT with 5.2 compatibility compiled in.
	jit52 = not loadstring("local goto = 1"),

	---the directory separator character for the current platform.
	dir_separator = _G.package.config:sub(1, 1),
}

---boolean flag this is a Windows platform.
compat.is_windows = compat.dir_separator == "\\"

---execute a shell command, in a compatible and platform independent way. This
---is a compatibility function that returns the same for Lua 5.1 and Lua 5.2+.
---
---NOTE: Windows systems can use signed 32bit integer exitcodes. Posix systems
---only use exitcodes 0-255, anything else is undefined.
---
---NOTE2: In Lua 5.2 and 5.3 a Windows exitcode of -1 would not properly be
---returned, this function will return it properly for all versions.
---@param cmd string -- a shell command
---@return boolean -- true if successful
---@return integer -- actual return code
function compat.execute(cmd) end

---Load Lua code as a text or binary chunk (in a Lua 5.2 compatible way).
---@param ld string -- code string or loader
---@param source? string -- name of chunk for errors (optional)
---@param mode? "b"|"t"|"bt" -- \'b', 't' or 'bt' (optional)
---@param env? table -- environment to load the chunk in (optional)
---@return function?, string?
---@nodiscard
function compat.load(ld, source, mode, env) end

---Get environment of a function (in a Lua 5.1 compatible way). Not 100%
---compatible, so with Lua 5.2 it may return nil for a function with no global
---references! Based on code by [Sergey Rozhenko](http://lua-users.org/lists/lua-l/2010-06/msg00313.html)
---@param f function|integer -- a function or a call stack reference
---@return table?
---@nodiscard
function compat.getfenv(f) end

---Set environment of a function (in a Lua 5.1 compatible way).
---@param f function|integer -- a function or a call stack reference
---@param env table -- a table that becomes the new environment for `f`
---@return function?
function compat.setfenv(f, env) end

return compat

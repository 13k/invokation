---@meta
---# Module [`pl.luabalanced`](https://lunarmodules.github.io/Penlight/libraries/pl.luabalanced.html)
---
---Extract delimited Lua sequences from strings.
---
---Inspired by Damian Conway's Text::Balanced in Perl.
---
---[1] [Lua Wiki Page](http://lua-users.org/wiki/LuaBalanced)
---
---[2] http://search.cpan.org/dist/Text-Balanced/lib/Text/Balanced.pm
---
---```lua
--- local lb = require "pl.luabalanced"
---
-----Extract Lua expression starting at position 4.
--- print(lb.match_expression("if x^2 + x > 5 then print(x) end", 4))
--- --> x^2 + x > 5     16
---
-----Extract Lua string starting at (default) position 1.
---print(lb.match_string([["test\"123" .. "more"]]))
-----> "test\"123"     12
---```
local luabalanced = {}

---Match Lua string in string `s` starting at position `pos`.
---@param s string
---@param pos integer
---@return string? string -- the matched string (or `nil` on no match)
---@return integer newpos -- the position following the match (or `pos` on no match)
---@nodiscard
function luabalanced.match_string(s, pos) end

---Match bracketed Lua expression, e.g. `"(...)"`, `"{...}"`, `"[...]"`,
---`"[[...]]"`, `[=[...]=]`, etc.
---
---Function interface is similar to match_string.
---@param s string
---@param pos integer
---@return string? string -- the matched string (or `nil` on no match)
---@return integer newpos -- the position following the match (or `pos` on no match)
---@nodiscard
function luabalanced.match_bracketed(s, pos) end

---Match Lua expression, e.g. "a + b * c[e]".
---
---Function interface is similar to match_string.
---@param s string
---@param pos integer
---@return string? string -- the matched string (or `nil` on no match)
---@return integer newpos -- the position following the match (or `pos` on no match)
---@nodiscard
function luabalanced.match_expression(s, pos) end

---Match name list (zero or more names).  E.g. "a,b,c"
---
---Function interface is similar to match_string, but returns array as match.
---@param s string
---@param pos integer
---@return string[] strings -- the matched strings
---@return integer newpos -- the position following the match (or `pos` on no match)
---@nodiscard
function luabalanced.match_namelist(s, pos) end

---Match expression list (zero or more expressions).  E.g. "a+b,b*c".
---Function interface is similar to match_string, but returns array as match.
---@param s string
---@param pos integer
---@return string[] strings -- the matched strings
---@return integer newpos -- the position following the match (or `pos` on no match)
---@nodiscard
function luabalanced.match_explist(s, pos) end

---Replace snippets of code in Lua code string `s` using replacement function
---`f(u, sin) --> sout`.
---
---`u` is the type of snippet
---('c' = comment, 's' = string, 'e' = any other code).
---Snippet is replaced with `sout` (unless `sout` is nil or false, in which
---case the original snippet is kept).
---
---This is somewhat analogous to `string.gsub`.
---@param s string
---@param f fun(u: string, sin: string): (sout: string|false|nil)
---@return string
---@nodiscard
function luabalanced.gsub(s, f) end

return luabalanced

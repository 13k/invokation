---@meta
---# Module [`pl.strict`](https://lunarmodules.github.io/Penlight/libraries/pl.strict.html)
---
---Checks uses of undeclared global variables.
---
---All global variables must be 'declared' through a regular assignment (even
---assigning nil will do) in a main chunk before being used anywhere or
---assigned to inside a function. Existing metatables `__newindex` and `__index`
---metamethods are respected.
---
---You can set any table to have strict behaviour using `strict.module`. Creating
---a new module with `strict.closed_module` makes the module immune to
---monkey-patching, if you don't wish to encourage monkey business.
---
---If the global `PENLIGHT_NO_GLOBAL_STRICT` is defined, then this module won't
---make the global environment strict - if you just want to explicitly set
---table strictness.
local strict = {}

---@param name? string
---@param mod nil
---@param predeclared? { [any]: true }
---@return table
---@nodiscard
function strict.module(name, mod, predeclared) end

---make an existing table strict.
---@param name? string -- name of table
---@param mod table -- the table to protect - if nil then we'll return a new table
---@param predeclared? { [any]: true } -- table of variables that are to be considered predeclared.
---@return table mod -- the given table, or a new table
---
---Usage:
---
---```lua
---local M = { hello = "world" }
---strict.module ("Awesome_Module", M, {
---  Lua = true,  -- defines allowed keys
---})
---
---assert(M.hello == "world")
---assert(M.Lua == nil)       -- access allowed, but has no value yet
---M.Lua = "Rocks"
---assert(M.Lua == "Rocks")
---M.not_allowed = "bad boy"  -- throws an error
---```
function strict.module(name, mod, predeclared) end

---make all tables in a table strict. So `strict.make_all_strict(_G)` prevents
---monkey-patching of any global table
---@param T table -- the table containing the tables to protect. Table `T` itself will NOT be protected.
function strict.make_all_strict(T) end

---make a new module table which is closed to further changes.
---@param mod table -- module table
---@param name string -- module name
---@return table
---@nodiscard
function strict.closed_module(mod, name) end

return strict

---@meta
---# Module `pl.import_into`
---
---PL loader, for loading all PL libraries, only on demand.
---
---Whenever a module is implicitly accesssed, the table will have the module
---automatically injected. (e.g. _ENV.tablex) then that module is dynamically
---loaded. The submodules are all brought into the table that is provided as
---the argument, or returned in a new table. If a table is provided, that
---table's metatable is clobbered, but the values are not. This module returns
---a single function, which is passed the environment. If this is true, then
---return a 'shadow table' as the module.
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/01-introduction.md.html#To_Inject_or_not_to_Inject_)
---@param env? table|true
---@return table -- `env`
---@return table -- `mod`
local function import_into(env) end

return import_into

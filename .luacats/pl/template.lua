---@meta
---# Module [`pl.template`](https://lunarmodules.github.io/Penlight/libraries/pl.template.html)
---
---A template preprocessor.
---
---Originally by [Ricki Lake](http://lua-users.org/wiki/SlightlyLessSimpleLuaPreprocessor)
---
---There are two rules:
---
---* lines starting with `#` are Lua
---* otherwise, `$(expr)` is the result of evaluating `expr`
---
---Example:
---
---```lua
---#  for i = 1,3 do
---   $(i) Hello, Word!
---#  end
---===>
---1 Hello, Word!
---2 Hello, Word!
---3 Hello, Word!
---```
---
---Other escape characters can be used, when the defaults conflict with the
---output language.
---
---```lua
---> for _,n in pairs{'one','two','three'} do
---static int l_${n} (luaState *state);
---> end
---```
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/03-strings.md.html#Another_Style_of_Template).
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#)
local template = {}

---expand the template using the specified environment. This function will
---compile and render the template. For more performant recurring usage use the
---two step approach by using `template.compile` and `ct:render`. There are six
---special fields in the environment table `env`
---
---* `_parent`: continue looking up in this table (e.g. `_parent=_G`).
---* `_brackets`: bracket pair that wraps inline Lua expressions, default is `()`.
---* `_escape`: character marking Lua lines, default is `#`.
---* `_inline_escape`: character marking inline Lua expression, default is `$`.
---* `_chunk_name`: chunk name for loaded templates, used if there is an error in Lua code. Default is `TMP`.
---* `_debug`: if truthy, the generated code will be printed upon a render error
---
---@param str string -- the template string
---@param env? table -- the environment
---@return string? rendered_template -- `nil` on error
---@return string? error -- `nil` on success
---@return string? source_code -- only returned if the debug option is used
---@nodiscard
function template.substitute(str, env) end

---@class pl.CompiledTemplate
local CompiledTemplate = {}

---executes the previously compiled template and renders it.
---@param env? table -- the environment.
---@param parent? table -- continue looking up in this table (e.g. `parent=_G`)
---@param db? boolean -- if truthy, it will print the code upon a render error (provided the template was compiled with the debug option).
---@return string? rendered_template -- `nil` on error
---@return string? error -- `nil` on success
---@return string? source_code -- only returned if the template was compiled with the debug option
---@nodiscard
function CompiledTemplate:render(env, parent, db) end

---@class pl.CompiledTemplate.Options
---chunk name for loaded templates, used if there is an error in Lua code.
---Default is `TMP`.
---@field chunk_name? string
---character marking Lua lines, default is `#`.
---@field escape? string
---character marking inline Lua expression, default is `$`.
---@field inline_escape? string
---bracket pair that wraps inline Lua expressions, default is `()`.
---@field inline_brackets? string
---string to replace newline characters, default is `nil` (not replacing newlines).
---@field newline? string
---if truthy, the generated source code will be retained within the compiled template object, default is `nil`.
---@field debug? any

---compiles the template. Returns an object that can repeatedly be rendered
---without parsing/compiling the template again. The options passed in the opts
---table support the following options:
---
---
---* `chunk_name`: chunk name for loaded templates, used if there is an error in Lua code. Default is `TMP`.
---* `escape`: character marking Lua lines, default is `#`.
---* `inline_escape`: character marking inline Lua expression, default is `$`.
---* `inline_brackets`: bracket pair that wraps inline Lua expressions, default is `()`.
---* `newline`: string to replace newline characters, default is `nil` (not replacing newlines).
---* `debug`: if truthy, the generated source code will be retained within the compiled template object, default is `nil`.
---
---@param str string -- the template string
---@param opts? pl.CompiledTemplate.Options -- the compilation options to use
---@return pl.CompiledTemplate? ct -- `nil` on error
---@return string? error -- `nil` on success
---@return string? source_code -- only returned if the debug option is used
---@nodiscard
---
---Usage:
---
---```lua
---local ct, err = template.compile(my_template)
---local rendered, err = ct:render(my_env, parent)
---```
function template.compile(str, opts) end

return template

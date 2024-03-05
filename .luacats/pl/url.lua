---@meta
---# Module [`pl.url`](https://lunarmodules.github.io/Penlight/libraries/pl.url.html)
---
---Python-style URL quoting library.
local url = {}

---Quote the url, replacing special characters using the '%xx' escape.
---@param s string -- the string
---@param quote_plus? boolean -- Also escape slashes and replace spaces by plus signs (default `false`).
---@return string -- The quoted string, or if `s` wasn't a string, just plain unaltered `s`.
---@nodiscard
function url.quote(s, quote_plus) end

---Unquote the url, replacing '%xx' escapes and plus signs.
---@param s string -- the string
---@return string -- The unquoted string, or if `s` wasn't a string, just plain unaltered `s`.
---@nodiscard
function url.unquote(s) end

return url

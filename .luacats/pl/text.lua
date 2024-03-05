---@meta
---# Module [`pl.text`](https://lunarmodules.github.io/Penlight/libraries/pl.text.html)
---
---Text processing utilities.
---
---This provides a `Template` class (modeled after the same from the Python
---libraries, see `string.Template`). It also provides similar functions to
---those found in the `textwrap` module.
---
---IMPORTANT: this module has been deprecated and will be removed in a future
---version (2.0). The contents of this module have moved to the `pl.stringx`
---module.
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/03-strings.md.html#String_Templates).
---
---Dependencies:
--- [`pl.stringx`](https://lunarmodules.github.io/Penlight/libraries/pl.stringx.html#),
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#)
---@deprecated -- use pl.stringx
local text = require("pl.stringx")

return text

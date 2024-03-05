---@meta

local os = os
local utils = require("pl.utils")
local dir = require("pl.dir")
local path = require("pl.path")

---# Module [`pl.file`](https://lunarmodules.github.io/Penlight/libraries/pl.file.html)
---
---File manipulation functions: reading, writing, moving and copying.
---
---This module wraps a number of functions from other modules into a file related module for convenience.
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [`pl.dir`](https://lunarmodules.github.io/Penlight/libraries/pl.dir.html#),
--- [`pl.path`](https://lunarmodules.github.io/Penlight/libraries/pl.path.html#)
local file = {
	read = utils.readfile,
	write = utils.writefile,
	copy = dir.copyfile,
	move = dir.movefile,
	access_time = path.getatime,
	creation_time = path.getctime,
	modified_time = path.getmtime,
	delete = os.remove,
}

return file

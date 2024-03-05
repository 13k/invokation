local lfs = require("lfs")

---@meta
---# Module [`pl.path`](https://lunarmodules.github.io/Penlight/libraries/pl.path.html)
---
---Path manipulation and file queries.
---
---This is modelled after Python's os.path library (10.1); see [the Guide](https://lunarmodules.github.io/Penlight/manual/04-paths.md.html#).
---
---NOTE: the functions assume the paths being dealt with to originate from the
---OS the application is running on. Windows drive letters are not to be used
---when running on a Unix system for example. The one exception is Windows
---paths to allow both forward and backward slashes (since Lua also accepts
---those)
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [`lfs`](http://stevedonovan.github.io/lua-stdlibs/modules/lfs.html)
local path = {
	---are we running Windows?
	is_windows = true or false,--[[@as boolean]]

	---path separator for this platform.
	sep = "/" or "\\",--[[@as string]]

	---separator for PATH for this platform
	dirsep = ";" or ";;",--[[@as string]]
}

path.dir = lfs.dir
path.mkdir = lfs.mkdir
path.rmdir = lfs.rmdir
path.attrib = lfs.attributes
path.currentdir = lfs.currentdir
path.link_attrib = lfs.symlinkattributes
path.chdir = lfs.chdir

---is this a directory?
---@param P string -- A file path
---@return boolean
---@nodiscard
function path.isdir(P) end

---is this a file?
---@param P string -- A file path
---@return boolean
---@nodiscard
function path.isfile(P) end

---is this a symbolic link?
---@param P string -- A file path
---@return boolean
---@nodiscard
function path.islink(P) end

---return size of a file.
---@param P string -- A file path
---@return integer
function path.getsize(P) end

---does a path exist?
---@param P string -- A file path
---@return boolean
---@nodiscard
function path.exists(P) end

---Return the time of last access as the number of seconds since the epoch.
---@param P string -- A file path
---@return integer
---@nodiscard
function path.getatime(P) end

---Return the time of last modification as the number of seconds since the epoch.
---@param P string -- A file path
---@return integer
---@nodiscard
function path.getmtime(P) end

---Return the system's ctime as the number of seconds since the epoch.
---@param P string -- A file path
---@return integer
---@nodiscard
function path.getctime(P) end

---given a path, return the directory part and a file part. if there's no
---directory part, the first value will be empty
---@param P string -- A file path
---@return string -- directory part
---@return string -- file part
---@nodiscard
---
---Usage:
---
---```lua
---local dir, file = path.splitpath("some/dir/myfile.txt")
---assert(dir == "some/dir")
---assert(file == "myfile.txt")
---
---local dir, file = path.splitpath("some/dir/")
---assert(dir == "some/dir")
---assert(file == "")
---
---local dir, file = path.splitpath("some_dir")
---assert(dir == "")
---assert(file == "some_dir")
---```
function path.splitpath(P) end

---return an absolute path.
---@param P string -- A file path
---@param pwd? string -- start path to use (default is current dir)
---@return string
---@nodiscard
function path.abspath(P, pwd) end

---given a path, return the root part and the extension part. if there's no
---extension part, the second value will be empty
---@param P string -- A file path
---@return string -- root part (everything up to the ".", maybe empty)
---@return string -- extension part (including the ".", maybe empty)
---@nodiscard
---
---Usage:
---
---```lua
---local file_path, ext = path.splitext("/bonzo/dog_stuff/cat.txt")
---assert(file_path == "/bonzo/dog_stuff/cat")
---assert(ext == ".txt")
---
---local file_path, ext = path.splitext("")
---assert(file_path == "")
---assert(ext == "")
---```
function path.splitext(P) end

---return the directory part of a path
---@param P string -- A file path
---@return string -- everything before the last dir-separator
---@nodiscard
---
---Usage:
---
---```lua
---path.dirname("/some/path/file.txt")   -- "/some/path"
---path.dirname("file.txt")              -- "" (empty string)
---```
function path.dirname(P) end

---return the file part of a path
---@param P string -- A file path
---@return string
---@nodiscard
---
---Usage:
---
---```lua
---path.basename("/some/path/file.txt")  -- "file.txt"
---path.basename("/some/path/file/")     -- "" (empty string)
---```
function path.basename(P) end

---get the extension part of a path.
---@param P string -- A file path
---@return string
---@nodiscard
---
---Usage:
---
---```lua
---path.extension("/some/path/file.txt") -- ".txt"
---path.extension("/some/path/file_txt") -- "" (empty string)
---```
function path.extension(P) end

---is this an absolute path?
---@param P string
---@return boolean
---@nodiscard
---
---Usage:
---
---```lua
---path.isabs("hello/path")      -- false
---path.isabs("/hello/path")     -- true
----- Windows;
---path.isabs("hello\\path")     -- false
---path.isabs("\\hello\\path")   -- true
---path.isabs("C:\\hello\\path") -- true
---path.isabs("C:hello\\path")   -- false
---```
function path.isabs(P) end

---return the path resulting from combining the individual paths. if the second
---(or later) path is absolute, we return the last absolute path (joined with
---any non-absolute paths following). empty elements (except the last) will be
---ignored.
---@param p1 string -- A file path
---@param p2 string -- A file path
---@param ... string -- more file paths
---@return string -- the combined path
---@nodiscard
---
---Usage:
---
---```lua
---path.join("/first","second","third")   -- "/first/second/third"
---path.join("first","second/third")      -- "first/second/third"
---path.join("/first","/second","third")  -- "/second/third"
---```
function path.join(p1, p2, ...) end

---normalize the case of a pathname. On Unix, this returns the path unchanged, for Windows it converts;
---
--- * the path to lowercase
--- * forward slashes to backward slashes
---
---@param P string -- A file path
---@return string
---@nodiscard
---
---Usage:
---
---```lua
---path.normcase("/Some/Path/File.txt")
----- Windows: "\some\path\file.txt"
----- Others : "/Some/Path/File.txt"
---```
function path.normcase(P) end

---normalize a path name. `A//B`, `A/./B`, and `A/foo/../B` all become `A/B`.
---
---An empty path results in `'.'`.
---@param P string -- a file path
---@return string
---@nodiscard
function path.normpath(P) end

---relative path from current directory or optional start point
---@param P string -- a path
---@param start? string -- start point (default current directory)
---@return string
---@nodiscard
function path.relpath(P, start) end

---Replace a starting `'~'` with the user's home directory. In windows, if HOME
---isn't set, then `USERPROFILE` is used in preference to `HOMEDRIVE` `HOMEPATH`.
---This is guaranteed to be writeable on all versions of Windows.
---@param P string -- A file path
---@return string
---@nodiscard
function path.expanduser(P) end

---Return a suitable full path to a new temporary file name. unlike
---`os.tmpname()`, it always gives you a writeable path (uses `TEMP` environment
---variable on Windows)
---@return string
---@nodiscard
function path.tmpname() end

---return the largest common prefix path of two paths.
---@param path1 string -- a file path
---@param path2 string -- a file path
---@return string -- the common prefix (Windows: separators will be normalized, casing will be original)
---@nodiscard
function path.common_prefix(path1, path2) end

---return the full path where a particular Lua module would be found. Both
---package.path and package.cpath is searched, so the result may either be a
---Lua file or a shared library.
---@param mod string -- name of the module
---@return string? -- path of module (`nil` on fail)
---@return boolean|string -- whether the module is in Lua or binary (error string listing paths tried on fail)
---@nodiscard
function path.package_path(mod) end

return path

---@meta
---# Module [`pl.dir`](https://lunarmodules.github.io/Penlight/libraries/pl.dir.html)
---
---Listing files in directories and creating/removing directory paths.
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html),
--- [`pl.path`](https://lunarmodules.github.io/Penlight/libraries/pl.path.html)
---
---Soft Dependencies: `alien`, `ffi` (either are used on Windows for copying/moving files)
local dir = {}

---Test whether a file name matches a shell pattern. Both parameters are
---case-normalized if operating system is case-insensitive.
---@param filename string -- A file name.
---@param pattern string -- A shell pattern. The only special characters are '*' and '?': '*' matches any sequence of characters and '?' matches any single character.
---@return boolean
---@nodiscard
function dir.fnmatch(filename, pattern) end

---Return a list of all file names within an array which match a pattern.
---@param filenames string[] -- An array containing file names.
---@param pattern string -- A shell pattern (see `dir.fnmatch`).
---@return string[] -- List of matching file names.
---@nodiscard
function dir.filter(filenames, pattern) end

---return a list of all files in a directory which match a shell pattern.
---@param dirname? string -- A directory. (default '.')
---@param mask? string -- A shell pattern (see `dir.fnmatch`). If not given, all files are returned. (optional)
---@return string[] -- list of files
---@nodiscard
function dir.getfiles(dirname, mask) end

---return a list of all subdirectories of the directory.
---@param dirname? string -- A directory. (default '.')
---@return string[] -- a list of directories
---@nodiscard
---
---Raises: dir must be a valid directory
function dir.getdirectories(dirname) end

---copy a file.
---@param src string -- source file
---@param dest string -- destination file or directory
---@param flag boolean -- true if you want to force the copy (default)
---@return boolean -- operation succeeded
function dir.copyfile(src, dest, flag) end

---move a file.
---@param src string -- source file
---@param dest string -- destination file or directory
---@return boolean -- operation succeeded
function dir.movefile(src, dest) end

---return an iterator which walks through a directory tree starting at root.
---The iterator returns (root,dirs,files) Note that dirs and files are lists
---of names (i.e. you must say path.join(root,d) to get the actual full
---path) If bottom_up is false (or not present), then the entries at the
---current level are returned before we go deeper. This means that you can
---modify the returned list of directories before continuing. This is a clone
---of os.walk from the Python libraries.
---@param root string -- A starting directory
---@param bottom_up? boolean -- False if we start listing entries immediately.
---@param follow_links? boolean -- follow symbolic links
---@return fun(): string -- an iterator returning root,dirs,files
---@nodiscard
---
---Raises: root must be a directory
function dir.walk(root, bottom_up, follow_links) end

return dir

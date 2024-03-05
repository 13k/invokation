---@meta
---# Module [`pl.stringx`](https://lunarmodules.github.io/Penlight/libraries/pl.stringx.html)
---
---Python-style extended string library.
---
---see 3.6.1 of the Python reference. If you want to make these available as
---string methods, then say `stringx.import()` to bring them into the standard
---[string](https://www.lua.org/manual/5.1/manual.html#5.4) table.
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/03-strings.md.html#)
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#)
--- [`pl.types`](https://lunarmodules.github.io/Penlight/libraries/pl.types.html#)
local stringx = {}

---does `s` only contain alphabetic characters?
---@param s string -- a string
---@return boolean
---@nodiscard
function stringx.isalpha(s) end

---does `s` only contain digits?
---@param s string -- a string
---@return boolean
---@nodiscard
function stringx.isdigit(s) end

---does s only contain alphanumeric characters?
---@param s string -- a string
---@return boolean
---@nodiscard
function stringx.isalnum(s) end

---does `s` only contain whitespace? Matches on pattern '%s' so matches space,
---newline, tabs, etc.
---@param s string -- a string
---@return boolean
---@nodiscard
function stringx.isspace(s) end

---does `s` only contain lower case characters?
---@param s string -- a string
---@return boolean
---@nodiscard
function stringx.islower(s) end

---does `s` only contain upper case characters?
---@param s string -- a string
---@return boolean
---@nodiscard
function stringx.isupper(s) end

---does `s` start with `prefix` or one of prefixes?
---@param s string -- a string
---@param prefix string[]|string -- a string or an array of strings
---@return boolean
---@nodiscard
function stringx.startswith(s, prefix) end

---does `s` end with `suffix` or one of suffixes?
---@param s string -- a string
---@param suffix string[]|string -- a string or an array of strings
---@return boolean
---@nodiscard
function stringx.endswith(s, suffix) end

---concatenate the strings using this string as a delimiter. Note that the
---arguments are reversed from `table.concat`.
---@param s string -- the string
---@param seq (string|number)[] -- a table of strings or numbers
---@return string
---@nodiscard
---
---Usage:
---
---```lua
---stringx.join(' ', {1,2,3}) == '1 2 3'
---```
function stringx.join(s, seq) end

---Split a string into a list of lines. "\r", "\n", and "\r\n" are considered
---line ends. They are not included in the lines unless keepends is passed.
---Terminal line end does not produce an extra line. Splitting an empty string
---results in an empty list.
---@param s string -- the string.
---@param keep_ends? boolean -- include line ends.
---@return string[] -- List of lines
---@nodiscard
function stringx.splitlines(s, keep_ends) end

---split a string into a list of strings using a delimiter.
---@param s string -- the string
---@param re? string -- a delimiter (defaults to whitespace)
---@param n? integer -- maximum number of results
---@return pl.List -- List
---@nodiscard
---
---Usage:
---
---```lua
---#(stringx.split('one two')) == 2
---
---stringx.split('one,two,three', ',') == List{ 'one', 'two', 'three' }
---
---stringx.split('one,two,three', ',', 2) == List{ 'one', 'two,three' }
---```
function stringx.split(s, re, n) end

---replace all tabs in `s` with `tabsize` spaces. If not specified, `tabsize`
---defaults to 8. Tab stops will be honored.
---@param s string -- the string
---@param tabsize? integer -- number of spaces to expand each tab (defaults to 8)
---@return string -- expanded string
---@nodiscard
---
---Usage:
---
---```lua
---stringx.expandtabs('\tone,two,three', 4)   == '    one,two,three'
---
---stringx.expandtabs('  \tone,two,three', 4) == '    one,two,three'
---```
function stringx.expandtabs(s, tabsize) end

---find index of first instance of `sub` in `s` from the left.
---@param s string -- the string
---@param sub string -- substring
---@param first? integer -- first index
---@param last? integer -- last index
---@return integer? -- start index, or nil if not found
---@nodiscard
function stringx.lfind(s, sub, first, last) end

---find index of first instance of sub in s from the right.
---@param s string -- the string
---@param sub string -- substring
---@param first? integer -- first index
---@param last? integer -- last index
---@return integer? -- start index, or nil if not found
---@nodiscard
function stringx.rfind(s, sub, first, last) end

---replace up to `n` instances of `old` by `new` in the string `s`. If `n` is
---not present, replace all instances.
---@param s string -- the string
---@param old string -- the target substring
---@param new string -- the substitution
---@param n? integer -- optional maximum number of substitutions
---@return string -- result string
---@nodiscard
function stringx.replace(s, old, new, n) end

---count all instances of `sub` in `s`.
---@param s string -- the string
---@param sub string -- substring
---@param allow_overlap? boolean -- allow matches to overlap
---@return integer
---@nodiscard
---
---Usage:
---
---```lua
---assert(stringx.count('banana', 'ana')       == 1)
---assert(stringx.count('banana', 'ana', true) == 2)
---```
function stringx.count(s, sub, allow_overlap) end

---left-justify `s` with width `w`.
---@param s string -- the string
---@param w integer -- width of justification
---@param ch? string -- padding character (default `' '`)
---@return string
---@nodiscard
---
---Usage:
---
---```lua
---stringx.ljust('hello', 10, '*') == '*****hello'
---```
function stringx.ljust(s, w, ch) end

---right-justify `s` with width `w`.
---@param s string -- the string
---@param w integer -- width of justification
---@param ch? string -- padding character (default `' '`)
---@return string
---@nodiscard
---
---Usage:
---
---```lua
---stringx.rjust('hello', 10, '*') == 'hello*****'
---```
function stringx.rjust(s, w, ch) end

---center-justify `s` with width `w`.
---@param s string -- the string
---@param w integer -- width of justification
---@param ch? string -- padding character (default `' '`)
---@return string
---@nodiscard
---
---Usage:
---
---```lua
---stringx.center('hello', 10, '*') == '**hello***'
---```
function stringx.center(s, w, ch) end

--- trim any characters on the left of `s`.
---@param s string -- the string
---@param chrs? string -- defaults to any whitespace character, but can be a string of characters to be trimmed
---@return string
---@nodiscard
function stringx.lstrip(s, chrs) end

---trim any characters on the right of `s`.
---@param s string -- the string
---@param chrs? string -- defaults to any whitespace character, but can be a string of characters to be trimmed
---@return string
---@nodiscard
function stringx.rstrip(s, chrs) end

---trim any characters on both left and right of `s`.
---@param s string -- the string
---@param chrs? string -- defaults to any whitespace character, but can be a string of characters to be trimmed
---@return string
---@nodiscard
---
---Usage:
---
---```lua
---stringx.strip('  --== Hello ==--  ', "- =")  --> 'Hello'
---```
function stringx.strip(s, chrs) end

---split a string using a pattern. Note that at least one value will be returned!
---@param s string -- the string
---@param re? string -- a Lua string pattern (defaults to whitespace)
---@return string, string ... -- the parts of the string
---@nodiscard
---
---Usage:
---
---```lua
---line = 'aaa=bbb'
---stringx.splitv(line, '=') == 'aaa', 'bbb'
---```
function stringx.splitv(s, re) end

---partition the string using first occurance of a delimiter
---@param s string -- the string
---@param ch string -- delimiter (match as plain string, no patterns)
---@return string -- part before `ch`
---@return string -- `ch`
---@return string -- part after `ch`
---@nodiscard
---
---Usage:
---
---```lua
---{stringx.partition('a,b,c', ',')} == {'a', ',', 'b,c'}
---
---{stringx.partition('abc', 'x')} == {'abc', '', ''}
---```
function stringx.partition(s, ch) end

---partition the string using last occurance of a delimiter
---@param s string -- the string
---@param ch string -- delimiter (match as plain string, no patterns)
---@return string -- part before `ch`
---@return string -- `ch`
---@return string -- part after `ch`
---@nodiscard
---
---Usage:
---
---```lua
---{stringx.rpartition('a,b,c', ',')} == {'a,b', ',', 'c'}
---
---{stringx.rpartition('abc', 'x')} == {'', '', 'abc'}
---```
function stringx.rpartition(s, ch) end

---return the 'character' at the index.
---@param s string -- the string
---@param idx integer -- an index (can be negative)
---@return string -- a substring of length 1 if successful, empty string otherwise.
---@nodiscard
function stringx.at(s, idx) end

---indent a multiline string.
---@param s string -- the (multiline) string
---@param n integer -- the size of the indent
---@param ch string? -- the character to use when indenting (default `' '`)
---@return string -- indented string
---@nodiscard
function stringx.indent(s, n, ch) end

---dedent a multiline string by removing any initial indent. Useful when
---working with `[[ ... ]]` strings. Empty lines are ignored.
---@param s string -- the (multiline) string
---@return string -- a string with initial indent zero.
---@nodiscard
---
---Usage:
---
---```lua
---local s = dedent [[
---         One
---
---       Two
---
---     Three
---]]
---
---assert(s == [[
---    One
---
---  Two
---
---Three
---]])
---```
function stringx.dedent(s) end

---format a paragraph into lines so that they fit into a line width. It will
---not break long words by default, so lines can be over the length to that
---extent.
---@param s string -- the string to format
---@param width? integer -- the margin width (default `70`)
---@param breaklong? boolean -- if truthy, words longer than the width given will be forced split. (default `false`)
---@return pl.List -- a list of lines (`List` object), use `stringx.fill` to return a string instead of a `List`.
---@nodiscard
function stringx.wrap(s, width, breaklong) end

---format a paragraph so that it fits into a line width.
---@param s string -- the string to format
---@param width? integer -- the margin width (default `70`)
---@param breaklong? boolean -- if truthy, words longer than the width given will be forced split. (default `false`)
---@return string -- a string, use `stringx.wrap` to return a list of lines instead of a string.
function stringx.fill(s, width, breaklong) end

---@class pl.Template
---Creates a new `Template` class. This is a shortcut to `Template.new(tmpl)`.
---@operator call(string): pl.Template
local prototype_Template = {}

stringx.Template = prototype_Template

---Creates a new Template class.
---@param tmpl string -- the template string
---@return pl.Template
---@nodiscard
function prototype_Template.new(tmpl) end

---substitute values into a template, throwing an error. This will throw an
---error if no name is found.
---@param tbl {[string]: string|number|false} -- a table of name-value pairs.
---@return string -- string with place holders substituted
---@nodiscard
function prototype_Template:substitute(tbl) end

---substitute values into a template. This version just passes unknown names
---through.
---@param tbl {[string]: string|number|false} -- a table of name-value pairs.
---@return string -- string with place holders substituted
---@nodiscard
function prototype_Template:safe_substitute(tbl) end

---substitute values into a template, preserving indentation.
---
---If the value is a multiline string or a template, it will insert the lines
---at the correct indentation.
---
---Furthermore, if a template, then that template will be substituted using
---the same table.
---@param tbl {[string]: string|number|false} -- a table of name-value pairs.
---@return string -- string with place holders substituted
---@nodiscard
function prototype_Template:indent_substitute(tbl) end

---return an iterator over all lines in a string
---@param s string -- the string
---@return fun(): string -- an iterator
---@nodiscard
---
---Usage:
---
---```lua
---local line_no = 1
---for line in stringx.lines(some_text) do
---  print(line_no, line)
---  line_no = line_no + 1
---end
---```
function stringx.lines(s) end

---inital word letters uppercase ('title case'). Here 'words' mean chunks of
---non-space characters.
---@param s string -- the string
---@return string -- a string with each word's first letter uppercase
---@nodiscard
---
---Usage:
---
---```lua
---stringx.title("hello world") == "Hello World"
---```
function stringx.title(s) end

---Return a shortened version of a string. Fits string within `w` characters.
---Removed characters are marked with ellipsis.
---@param s string -- the string
---@param w integer -- the maximum size allowed
---@param tail? boolean -- `true` if we want to show the end of the string (head otherwise)
---@return string
---@nodiscard
---
---Usage:
---
---```lua
---('1234567890'):shorten(8) == '12345...'
---
---('1234567890'):shorten(8, true) == '...67890'
---
---('1234567890'):shorten(20) == '1234567890'
---```
function stringx.shorten(s, w, tail) end

---Quote the given string and preserve any control or escape characters, such
---that reloading the string in Lua returns the same result.
---@param s string -- the string to be quoted
---@return string -- The quoted string.
---@nodiscard
function stringx.quote_string(s) end

---Python-style formatting operator. Calling text.format_operator() overloads the
---`%` operator for strings to give Python/Ruby style formated output. This is
---extended to also do template-like substitution for map-like data.
---
---Note this goes further than the original, and will allow these cases:
---
---1. a single value
---2. a list of values
---3. a map of var=value pairs
---4. a function, as in gsub
---
---For the last two cases, it uses $-variable substitution.
---
---See the [lua-users wiki](http://lua-users.org/wiki/StringInterpolation)
---
---Usage:
---
---```lua
---require 'pl.text'.format_operator()
---local out1 = '%s = %5.3f' % {'PI',math.pi}                   --> 'PI = 3.142'
---local out2 = '$name = $value' % {name='dog',value='Pluto'}   --> 'dog = Pluto'
---```
function stringx.format_operator() end

---import the `stringx` functions into the global string (meta)table
function stringx.import() end

return stringx

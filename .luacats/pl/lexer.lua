---@meta
---# Module [`pl.lexer`](https://lunarmodules.github.io/Penlight/libraries/pl.lexer.html)
---
---Lexical scanner for creating a sequence of tokens from text.
---
---`lexer.scan(s)` returns an iterator over all tokens found in the string s.
---This iterator returns two values, a token type string (such as 'string' for
---quoted string, 'iden' for identifier) and the value of the token.
---
---Versions specialized for Lua and C are available; these also handle block
---comments and classify keywords as 'keyword' tokens. For example:
---
---```lua
---> s = 'for i=1,n do'
---> for t,v in lexer.lua(s)  do print(t,v) end
---keyword for
---iden    i
---=       =
---number  1
---,       ,
---iden    n
---keyword do
---```
---
---See the Guide for further [discussion](https://lunarmodules.github.io/Penlight/manual/06-data.md.html#Lexical_Scanning)
local lexer = {}

---@alias pl.TokenStream fun(): (string, string)

---@alias pl.LexerFilter { [function]: true, space?: boolean, comments?: boolean }

---@alias pl.LexerOptions {[string]: any}

---create a plain token iterator from a string or file-like object.
---@param s string|file* -- a string or a file-like object with :read() method returning lines.
---@param matches? {[1]: string, [2]: fun(token: string, options: {[string]: any}, bounds: { [1]: integer, [2]: integer })}[] -- an optional match table - array of token descriptions. A token is described by a `{pattern, action}` pair, where pattern should match token body and action is a function called when a token of described type is found.
---@param filter? pl.LexerFilter -- a table of token types to exclude, by default `{ space = true }`
---@param options? {[string]: any} -- a table of options; by default, `{ number = true, string = true }` which means convert numbers and strip string quotes.
---@return pl.TokenStream -- a token stream
---@nodiscard
function lexer.scan(s, matches, filter, options) end

---insert tokens into a stream.
---@param tok pl.TokenStream -- a token stream
---@param a1 string -- a string is the type, a table is a token list and a function is assumed to be a token-like iterator (returns type & value)
---@param a2 string -- a string is the value
---@overload fun(tok: pl.TokenStream, a1: fun(): pl.TokenStream)
---@overload fun(tok: pl.TokenStream, a1: {[1]: string, [2]: string}[])
function lexer.insert(tok, a1, a2) end

lexer.insert(lexer.scan(""), { { "e", "r" } })

---get current line number.
---@param tok pl.TokenStream -- a token stream
---@return integer -- the line number.
---@return integer -- if the input source is a file-like object, also return the column.
---@nodiscard
function lexer.lineno(tok) end

---get the rest of the stream.
---@param tok pl.TokenStream -- a token stream
---@return string -- a string
---@nodiscard
function lexer.getrest(tok) end

---get the Lua keywords as a set-like table. So res["and"] etc would be true.
---@return { [string]: true? } -- a table
---@nodiscard
function lexer.get_keywords() end

---create a Lua token iterator from a string or file-like object. Will return
---the token type and value.
---@param s string -- the string
---@param filter? pl.LexerFilter -- a table of token types to exclude, by default `{ space = true, comments = true }` (optional)
---@param options? pl.LexerOptions -- a table of options; by default, `{ number = true, string = true }`, which means convert numbers and strip string quotes. (optional)
---@return pl.TokenStream
---@nodiscard
function lexer.lua(s, filter, options) end

---create a C/C++ token iterator from a string or file-like object. Will return
---the token type type and value.
---@param s string -- the string
---@param filter? pl.LexerFilter -- a table of token types to exclude, by default `{ space = true, comments = true }` (optional)
---@param options? pl.LexerOptions -- a table of options; by default, `{ number = true, string = true }`, which means convert numbers and strip string quotes. (optional)
---@return pl.TokenStream
---@nodiscard
function lexer.cpp(s, filter, options) end

---get a list of parameters separated by a delimiter from a stream.
---@param tok pl.TokenStream -- the token stream
---@param endtoken string -- end of list. Can be '\n' (default `)`)
---@param delim string -- separator (default `,`)
---@nodiscard
function lexer.get_separated_list(tok, endtoken, delim) end

---get the next non-space token from the stream.
---@param tok pl.TokenStream -- the token stream.
---@return string, string
---@nodiscard
function lexer.skipws(tok) end

---get the next token, which must be of the expected type. Throws an error if
---this type does not match!
---@param tok pl.TokenStream -- the token stream
---@param expected_type string -- the token type
---@param no_skip_ws? boolean -- whether we should skip whitespace
---@return string -- the value
function lexer.expecting(tok, expected_type, no_skip_ws) end

return lexer

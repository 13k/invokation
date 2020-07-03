local pp = require("pl.pretty")
local tablex = require("pl.tablex")

local USAGE = "Usage: %s <input> <output>\n"

function stderr(...)
  io.stderr:write(...)
end

function usage()
  stderr(USAGE:format(arg[0]))
end

function parse(input)
  local tokens = {}
  local token = {}
  local cur = {line = 1, col = 0}

  repeat
    ch = input:read(1)
    cur.col = cur.col + 1

    if ch == nil then
      break
    elseif ch:match("[ \t\r]") then
      if token.type == "id" then
        token.value = token.value .. ch
      end
    elseif ch == "\n" then
      if token.type == "id" then
        token.value = token.value .. ch
      else
        cur.line = cur.line + 1
        cur.col = 0
      end
    elseif ch == "/" then
      if token.type == "id" then
        token.value = token.value .. ch
      else
        ch = input:read(1)
        cur.col = cur.col + 1

        if ch == "/" then
          -- read whole line and ignore it
          local rest = input:read()
          cur.line = cur.line + 1
          cur.col = 0
        else
          -- return to first "/" char
          ch = "/"
          input:seek("cur", -1)
          cur.col = cur.col - 1
        end
      end
    elseif ch == '"' then
      if token.type == nil then
        token = {type = "id", value = "", offset = input:seek(), line = cur.line, col = cur.col}
      elseif token.type == "id" then
        table.insert(tokens, token)
        token = {}
      else
        local msg = ("Unexpected character %q at %d:%d"):format(ch, cur.line, cur.col)
        error(msg)
      end
    elseif ch == "{" then
      token = {type = "scope_open", value = ch, offset = input:seek(), line = cur.line, col = cur.col}

      table.insert(tokens, token)
      token = {}
    elseif ch == "}" then
      token = {type = "scope_close", value = ch, offset = input:seek(), line = cur.line, col = cur.col}

      table.insert(tokens, token)
      token = {}
    else
      if token.type == "id" then
        token.value = token.value .. ch
      else
        local msg = ("Unexpected character %q at %d:%d"):format(ch, cur.line, cur.col)
        error(msg)
      end
    end
  until ch == nil

  return tokens
end

function rewrite(tokens)
  local rewritten = {}
  local scope_index = 0

  local function is_item_key(token)
    return token and token.type == "id" and token.value == "item"
  end

  for i, token in ipairs(tokens) do
    local prev_token = tokens[i - 1]
    local next_token = tokens[i + 1]

    if token.type == "scope_open" and is_item_key(next_token) then
      scope_index = 1
      table.insert(rewritten, token)
    elseif token.type == "scope_close" then
      scope_index = 0
      table.insert(rewritten, token)
    elseif scope_index > 0 and is_item_key(token) then
      local mod_token = tablex.copy(token)
      mod_token.value = tostring(scope_index)
      table.insert(rewritten, mod_token)
      scope_index = scope_index + 1
    elseif scope_index > 0 and token.type == "id" and is_item_key(prev_token) then
      -- skip `river_painter` items
      if token.value:match("item_river_painter") then
        table.remove(rewritten)
        scope_index = scope_index - 1
      else
        table.insert(rewritten, token)
      end
    else
      table.insert(rewritten, token)
    end
  end

  return rewritten
end

function dump(tokens, output)
  local indent_level = 0
  local indent = "  "
  local id_quote = '"'
  local key_value_sep = " "
  local properties_block = false
  local properties_block_ident_is_key = false

  for i, token in ipairs(tokens) do
    if token.type == "id" then
      local quoted_id = id_quote .. token.value .. id_quote

      if properties_block then
        if properties_block_ident_is_key then
          output:write(string.rep(indent, indent_level))
          output:write(quoted_id)

          properties_block_ident_is_key = false
        else
          output:write(key_value_sep)
          output:write(quoted_id)
          output:write("\n")

          properties_block_ident_is_key = true
        end
      else
        output:write(string.rep(indent, indent_level))
        output:write(quoted_id)
      end
    elseif token.type == "scope_open" then
      output:write("\n")
      output:write(string.rep(indent, indent_level))
      output:write(token.value)
      output:write("\n")

      indent_level = indent_level + 1
      properties_block = true
      properties_block_ident_is_key = true
    elseif token.type == "scope_close" then
      indent_level = indent_level - 1

      output:write(string.rep(indent, indent_level))
      output:write(token.value)
      output:write("\n")

      if tokens[i + 1] and tokens[i + 1].type == "id" then
        output:write("\n")
      end

      properties_block = false
    end
  end
end

function main()
  if #arg < 2 then
    usage()
    os.exit(1)
  end

  local input, err = io.open(arg[1], "r")

  if err ~= nil then
    error(err)
  end

  local tokens = parse(input)

  tokens = rewrite(tokens)

  local output, err = io.open(arg[2], "w+")

  if err ~= nil then
    error(err)
  end

  dump(tokens, output)

  print(("Output written to %s"):format(arg[2]))
end

main()

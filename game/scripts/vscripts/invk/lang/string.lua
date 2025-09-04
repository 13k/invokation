--- @class invk.lang.string
local M = {}

--- Remove whitespace from start and end of a string.
--- @param s string
--- @return string
function M.trim(s)
  -- ignore multi-value return
  s = s:gsub("^%s*", ""):gsub("%s*$", "")

  return s
end

--- Split a string at separator.
--- @param s string
--- @param sep string
--- @param count? integer
--- @return string[]
function M.split(s, sep, count)
  if count == nil then
    count = -1
  end

  if count == 1 then
    return { s }
  end

  local res = {}

  local n = 0
  --- @type integer?
  local i = 1
  --- @type integer?
  local j

  i, j = s:find(sep, 1, true)

  while i and j do
    res[#res + 1] = s:sub(1, i - 1)
    n = n + 1
    s = s:sub(j + 1)

    if count > 1 and n == (count - 1) then
      res[#res + 1] = s
      s = ""

      break
    end

    i, j = s:find(sep, 1, true)
  end

  if #s > 0 then
    res[#res + 1] = s
  end

  if #res == 0 then
    res = { s }
  end

  return res
end

--- Return the maximum string length in a list of strings.
--- @param t string[]
--- @return integer
function M.max_len(t)
  local max = 0

  for _, s in ipairs(t) do
    if #s > max then
      max = #s
    end
  end

  return max
end

return M

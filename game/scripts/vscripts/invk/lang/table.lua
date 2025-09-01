--- @class invk.lang.table
local M = {}

--- Count the number of items in a table.
--- @param t table
--- @return integer
function M.size(t)
  local i = 0

  for _, _ in pairs(t) do
    i = i + 1
  end

  return i
end

--- Check if table is empty.
--- @param t table
--- @return boolean
function M.is_empty(t)
  return M.size(t) == 0
end

--- Clone a table.
--- @generic K, V
--- @param t { [K]: V }
--- @param deep? boolean
--- @return { [K]: V }
function M.clone(t, deep)
  local res = {}

  for k, v in pairs(t) do
    if type(v) == "table" and deep then
      res[k] = M.clone(v, deep)
    else
      res[k] = v
    end
  end

  return res
end

--- Collect table keys.
--- @generic K, V
--- @param t { [K]: V }
--- @return K[]
--- @overload fun(t: V[]): integer[]
function M.keys(t)
  local res = {}

  for k, _ in pairs(t) do
    res[#res + 1] = k
  end

  return res
end

--- Collect table values.
--- @generic K, V
--- @param t { [K]: V }
--- @return V[]
function M.values(t)
  local res = {}

  for _, v in pairs(t) do
    res[#res + 1] = v
  end

  return res
end

--- Get the maximum value in a table.
--- @generic K, V
--- @param t { [K]: V }
--- @return V
function M.max(t)
  --- @type V
  local max = nil

  for _, v in pairs(t) do
    if max == nil or v > max then
      max = v
    end
  end

  return max
end

--- @generic K, V
--- @param t { [K]: V }
--- @param value V | (fun(v: V): boolean)
--- @return K?
--- @overload fun(t: V[], value: V | (fun(v: V): boolean)): integer?
function M.index(t, value)
  --- @type fun(elem: V): boolean
  local matcher

  if type(value) == "function" then
    matcher = value
  else
    matcher = function(elem)
      return elem == value
    end
  end

  for k, v in pairs(t) do
    if matcher(v) then
      return k
    end
  end

  return nil
end

--- Pick values at given indices.
--- @generic T
--- @param t T[]
--- @param ... integer
--- @return T[]
function M.at(t, ...)
  --- @type T[]
  local res = {}

  for i = 1, select("#", ...) do
    local index = select(i, ...)

    res[#res + 1] = t[index]
  end

  return res
end

--- Pick values at given keys.
--- @generic K, V
--- @param t { [K]: V }
--- @param ... K
--- @return { [K]: V }
function M.select(t, ...)
  local res = {}

  for i = 1, select("#", ...) do
    local key = select(i, ...)

    res[key] = t[key]
  end

  return res
end

--- Slices a list with given range.
--- @generic T
--- @param t T[]
--- @param i? integer
--- @param j? integer
--- @return T[]
function M.slice(t, i, j)
  i = i or 1
  j = j or #t

  local res = {}

  for n = i, j do
    res[#res + 1] = t[n]
  end

  return res
end

--- Append values to list.
--- @generic T
--- @param t T[]
--- @param ... T[]
--- @return T[]
function M.append(t, ...)
  local tt = { ... }

  table.insert(tt, 1, t)

  --- @type T[]
  local res = {}

  for _, src in ipairs(tt) do
    for _, value in ipairs(src) do
      res[#res + 1] = value
    end
  end

  return res
end

--- Converts a sparse list to continous list.
--- @generic T
--- @param t { [integer]: T }
--- @return T[]
function M.compact(t)
  --- @type T[]
  local res = {}
  local indices = M.keys(t)

  table.sort(indices)

  for _, i in ipairs(indices) do
    res[#res + 1] = t[i]
  end

  return res
end

--- Extend a table with other tables.
---
--- **Modifies `t` in-place!**
--- @generic T1: table
--- @generic T2: table
--- @param t T1
--- @param ... T2
--- @return T1 | T2
function M.extend(t, ...)
  local tt = { ... }

  for _, src in ipairs(tt) do
    for k, v in pairs(src) do
      t[k] = v
    end
  end

  return t
end

--- Filter table entries that matches a predicate.
--- @generic K, V
--- @param t { [K]: V }
--- @param filter fun(value: V, key: K): boolean
--- @return { [K]: V }
--- @overload fun(t: V[], filter: (fun(value: V, index: integer): boolean)): V[]
function M.filter(t, filter)
  return M.map(t, function(value, key)
    if filter(value, key) then
      return value
    else
      return nil
    end
  end)
end

--- Map table entries with the given map function.
--- @generic K1, V1, K2, V2
--- @param t { [K1]: V1 }
--- @param map (fun(value: V1, key: K1): V2?)
--- @return { [K2]: V2 }
--- @overload fun(t: V1[], map: (fun(value: V1, index: integer): V2?)): V2[]
function M.map(t, map)
  if t == nil then
    return {}
  end

  --- @type { [K2]: V2 }
  local res = {}

  for k1, v1 in pairs(t) do
    -- if `map` doesn't return (key, value), the return type is (value,)
    local kv, v2 = map(v1, k1)
    local key = v2 and kv or k1
    local value = v2 or kv

    res[key] = value
  end

  return res
end

--- Alias of [map].
--- @generic K1, V1, K2, V2
--- @param t { [K1]: V1 }
--- @param transform (fun(value: V1, key: K1): K2?, V2?)
--- @return { [K2]: V2 }
--- @overload fun(t: V1[], map: (fun(value: V1, index: integer): K2?, V2?)): { [K2]: V2 }
function M.transform(t, transform)
  return M.map(t, transform)
end

--- Reduce table values with the given reduce function.
--- @generic K, V, R
--- @param t { [K]: V }
--- @param reduce fun(acc: R, value: V, key: K): R
--- @param init? R
--- @return R
--- @overload fun(t: V[], reduce: (fun(acc: R, value: V, index: integer): R), init: R): R
--- @overload fun(t: V[], reduce: (fun(acc: V, value: V): V)): V
function M.reduce(t, reduce, init)
  if t == nil then
    return init
  end

  local acc = init
  local first = true

  for k, v in pairs(t) do
    if first and not init then
      acc = v
    else
      acc = reduce(acc, v, k)
    end

    first = false
  end

  return acc
end

--- Returns the difference between two lists.
--- @generic T
--- @param left T[]
--- @param right T[]
--- @return T[]
function M.diff(left, right)
  return M.filter(left, function(value)
    return not M.contains(right, value)
  end)
end

--- Tests if a table contains a value.
--- @generic K, V
--- @param t { [K]: V }
--- @param value V
--- @param eq? fun(left: V, right: V): boolean
--- @return boolean
--- @overload fun(t: V[], value: V): boolean
function M.contains(t, value, eq)
  if t == nil then
    return false
  end

  for _, v in pairs(t) do
    --- @type boolean
    local is_eq

    if eq then
      is_eq = eq(value, v)
    else
      is_eq = value == v
    end

    if is_eq then
      return true
    end
  end

  return false
end

--- Tests if every entry of a table matches a predicate.
--- @generic K, V
--- @param t { [K]: V }
--- @param predicate fun(value: V, key: K): boolean
--- @return boolean
function M.all(t, predicate)
  if t == nil then
    return true
  end

  for k, v in pairs(t) do
    if not predicate(k, v) then
      return false
    end
  end

  return true
end

return M

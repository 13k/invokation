--[[--
ModMaker Library by BMD.

### Installation

- `require` this module and call @{Start}.
- Ensure that you have the `modmaker/modmaker.xml`,
  `modmaker/modmaker_api_category.xml`, and
  `modmaker/modmaker_api_property.xml` in your panorama content layout
  folder.
- Ensure that you have the `modmaker/modmaker.js`,
  `modmaker/modmaker_api_category.js`, and
  `modmaker/modmaker_api_property.js` in your panorama content scripts
  folder.
- Ensure that you have the `modmaker/modmaker.css` in your panorama content
  styles folder.
- Ensure that `modmaker/modmaker.xml` is included in your
  `custom_ui_manifest.xml` with

    <CustomUIElement type="Hud" layoutfile="file://{resources}/layout/custom_game/modmaker/modmaker.xml" />

### Usage

- The library when required in registers the `modmaker_api` console command
  (if in tools mode)
- Executing the `modmaker_api` console command will display the modmaker API
  UI in the game window, which allows for searching and exploring of the lua
  API.
- This API is based on the actual server vscript itself, and as such is
  always up to date and accurate (to the Valve docs).
- Each function has a "Search GitHub" button which will open the default
  browser on your system to search github for uses of the function in question.

Original code: [https://github.com/bmddota/barebones](https://github.com/bmddota/barebones)

@module invokation.dota2.modmaker
@author bmddota (original author)
@author 13k (updates)
@license Apache License 2.0
@copyright bmddota
]]

local M = {_VERSION = "0.80"}

local function GetAPI(t, sub, done)
  if type(t) ~= "table" then
    return
  end

  done = done or {}
  done[t] = true
  sub = sub or M.api

  local l = {}
  local ret = nil

  for k, _ in pairs(t) do
    table.insert(l, k)
  end

  table.sort(l)

  for _, v in ipairs(l) do
    -- Ignore FDesc
    if v == "CDesc" then
      --print('======================')
      --PrintTable(t[v])
      --print('======================')
      GetAPI(t[v], nil, done)
      ret = true
    elseif v ~= "FDesc" then
      local value = t[v]

      if type(value) == "table" and not done[value] then
        done[value] = true
        if type(v) == "string" and v:sub(1, 1):find("[A-Z]") then
          v = v:gsub("CDOTA_", "")
          v = v:gsub("CDOTA", "")
          if v:sub(2, 2):find("[A-Z]") then
            v = v:sub(2)
          end
          local temp = {}
          local r = GetAPI(value, temp, done)
          if r then
            sub[v] = temp
            ret = true
          end
        end
      else
        if t.FDesc and t.FDesc[v] then
          local func, desc = string.match(tostring(t.FDesc[v]), "(.*)\n(.*)")
          if sub == M.api then
            M.api.__GLOBAL__[v] = {f = func, d = desc}
          else
            sub[v] = {f = func, d = desc}
          end
          ret = true
        end
      end
    end
  end

  return ret
end

function M.openGithub(_, msg)
  local search = msg.search
  local language = msg.language

  print("[ModMaker] OpenGithub", search, language)

  local url = "https://github.com/search?utf8=%E2%9C%93&q=" .. search .. "&l=" .. language .. "&type=Code"
  local t = io.popen('start "Browser" "' .. url .. '"')
  t:lines()
end

function M.sendAPI()
  M.buildAPI()
  CustomGameEventManager:Send_ServerToAllClients("modmaker_lua_api", {api = M.api})
end

function M.buildAPI()
  if not M.apiBuilt then
    print("[ModMaker] building API")
    GetAPI(_G)
    M.apiBuilt = true
  end
end

--- Initializes ModMaker.
function M.Start()
  M.api = {__GLOBAL__ = {}}
  M.initialized = true

  Convars:RegisterCommand(
    "modmaker_api",
    Dynamic_Wrap(M, "sendAPI"),
    "Show the ModMaker lua API for a searchable listing of the server lua vscript.",
    FCVAR_CHEAT
  )

  CustomGameEventManager:RegisterListener("ModMaker_OpenGithub", Dynamic_Wrap(M, "openGithub"))
end

return M

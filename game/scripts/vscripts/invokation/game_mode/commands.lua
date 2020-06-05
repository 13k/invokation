--- Console Commands
-- @submodule invokation.GameMode

--- Console Commands
-- @section commands

local pp = require("pl.pretty")
local tablex = require("pl.tablex")
local Logger = require("invokation.Logger")
local Invoker = require("invokation.dota2.Invoker")

local COMMANDS = require("invokation.const.commands")

local function createHandler(gameMode, methodName)
  return function(command, ...)
    gameMode:d(command, methodName, ...)

    local callback = gameMode:methodHandler(methodName)
    local player = Convars:GetDOTACommandClient()

    return callback(player, ...)
  end
end

function GameMode:registerCommand(command, methodName, help, flags)
  return Convars:RegisterCommand(command, createHandler(self, methodName), help, flags or 0)
end

function GameMode:registerCommands()
  for _, spec in ipairs(COMMANDS) do
    if not spec.dev or (spec.dev and self.env.development) then
      self:registerCommand(spec.name, spec.method, spec.help, spec.flags)
    end
  end

  self:d("  register commands")
end

--- Sets debugging on/off.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam ?string arg `"1"`: enables debugging, `"0"`: disables debugging,
--   `nil`: prints debugging value.
-- luacheck: no unused args
function GameMode:CommandSetDebug(player, arg)
  if arg == "1" then
    self.logger.level = Logger.DEBUG
  elseif arg == "0" then
    self.logger.level = Logger.INFO
  else
    print(string.format("inv_debug = %d", self.logger.level <= Logger.DEBUG and 1 or 0))
  end
end

--- Placeholder command to run miscellaneous debug code.
--
-- Use `script_reload` to reload after changes.
--
-- @tparam CDOTAPlayer player Player who issued this console command.
-- @param[opt] ... varargs.
-- luacheck: no unused args
function GameMode:CommandDebugMisc(player, ...)
end

--- Dumps Lua version.
-- @tparam CDOTAPlayer player Player who issued this console command
function GameMode:CommandDumpLuaVersion()
  print(_VERSION)
end

--- Dumps global value.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string name Dot-separated value name
-- luacheck: no unused args
function GameMode:CommandDumpGlobal(player, name)
  if not name then return end

  local value = _G

  for segment in name:gmatch("([^.]+)%.?") do
    value = value[segment]
  end

  local typ = type(value)
  local repr = pp.write(value)

  print(string.format("%q (%s): %s", name, typ, repr))

  if typ == "function" then
    local info = debug.getinfo(value)
    print(string.format("source: %s:%d", info.source, info.linedefined))
  end
end

--- Searches a global value.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string pattern Name pattern (uses `string.match` for matching)
-- luacheck: no unused args
function GameMode:CommandFindGlobal(player, pattern)
  if not pattern then return end

  local matches = {}

  for name, _ in pairs(_G) do
    if name:match(pattern) then
      table.insert(matches, name)
    end
  end

  table.sort(matches)

  print(string.format("Globals matching pattern %q:", pattern))

  for _, match in ipairs(matches) do
    print(string.format(" * %s", match))
  end

  print("---")
end

--- Queries items.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string query Query string
-- luacheck: no unused args
function GameMode:CommandItemQuery(player, query)
  if not query then return end

  local items = self.itemsKV:Search(query)

  if tablex.size(items) == 0 then
    print("No items found.")
    return
  end

  for name, kv in pairs(items) do
    local repr = pp.write(kv)
    print(name, repr)
  end
end

local function debugAbility(a, simple)
  if a == nil then
    return nil
  end

  if simple then
    return { a:GetAbilityIndex(), a:GetAbilityName(), a:GetLevel() }
  end

  return {
    name = a:GetAbilityName(),
    index = a:GetAbilityIndex(),
    type = a:GetAbilityType(),
    level = a:GetLevel(),
    maxLevel = a:GetMaxLevel(),
    damage = a:GetAbilityDamage(),
    damageType = a:GetAbilityDamageType(),
    isCastable = a:IsFullyCastable(),
    isActivated = a:IsActivated(),
    isHidden = a:IsHidden(),
    isAttributeBonus = a:IsAttributeBonus(),
    isItem = a:IsItem(),
    isPassive = a:IsPassive(),
    procsMagicStick = a:ProcsMagicStick(),
    isTrained = a:IsTrained(),
    canBeUpgraded = a:CanAbilityBeUpgraded(),
    heroLevelToUpgrade = a:GetHeroLevelRequiredToUpgrade(),
    duration = a:GetDuration(),
    castRange = a:GetCastRange(),
    castPoint = a:GetCastPoint(),
    backswingTime = a:GetBackswingTime(),
    channelTime = a:GetChannelTime(),
  }
end

--- Dumps current hero abilities.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam[opt] string simple Simple version or verbose
-- luacheck: no unused args
function GameMode:CommandDumpAbilities(player, simple)
  local hero = player:GetAssignedHero()

  for i = 0, hero:GetAbilityCount() - 1 do
    local a = hero:GetAbilityByIndex(i)
    local repr = pp.write(debugAbility(a, simple))
    print(i, repr)
  end
end

--- Invokes ability by name.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string ability Ability name
-- luacheck: no unused args
function GameMode:CommandInvokeAbility(player, ability)
  if not ability then return end

  local hero = player:GetAssignedHero()
  local invoker = Invoker(hero)

  invoker:Invoke(ability)
end

--- Dumps combo graph in DOT format.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string id Combo id
-- luacheck: no unused args
function GameMode:CommandDumpComboGraph(player, id)
  if not id then return end

  local combo = self.combos:createCombo(tonumber(id))

  if combo == nil then
    print("Could not find combo")
    return
  end

  print(combo:todot())
end

--- Changes music status.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string status Music status
-- @tparam string intensity Music intensity
-- luacheck: no unused args
function GameMode:CommandChangeMusicStatus(player, status, intensity)
  if not status or not intensity then return end

  status = tonumber(status)
  intensity = tonumber(intensity)

  player:SetMusicStatus(status, intensity)
end

--- Dumps Invoker ability specials values.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam[opt] string onlyScaling Dump only values that scale, ignoring fixed values
-- luacheck: no unused args
function GameMode:CommandDumpSpecials(player, onlyScaling)
  local cmd = require("invokation.game_mode.commands.dump_specials")
  cmd.dump(player, { onlyScaling = onlyScaling ~= nil })
end

--- Debug operations on ability specials KeyValues.
--
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string op Operation name (dump, findKeys, findValues)
-- @tparam string query Operation query (dump: path, findKeys: pattern, findValues: pattern)
-- luacheck: no self
function GameMode:CommandDebugSpecials(player, op, query)
  local cmd = require("invokation.game_mode.commands.debug_specials")

  if op == "dump" then
    cmd.dump(query)
  elseif op == "findKeys" then
    cmd.findKeys(query)
  elseif op == "findValues" then
    cmd.findValues(query)
  end
end

--- Reinserts an ability into the current hero.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string name Ability name
-- luacheck: no unused args
function GameMode:CommandReinsertAbility(player, name)
  if not name then return end

  local hero = player:GetAssignedHero()
  local ability = hero:FindAbilityByName(name)
  local index = ability:GetAbilityIndex()
  local level = ability:GetLevel()

  hero:RemoveAbility(name)

  ability = hero:AddAbility(name)
  ability:SetAbilityIndex(index)
  ability:SetLevel(level)
end
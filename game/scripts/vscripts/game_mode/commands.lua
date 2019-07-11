local lfunc = require("lang.function")
local Logger = require("lib.logger")
local Invoker = require("dota2.invoker")

function GameMode:registerCommands()
  Convars:RegisterCommand(
    "inv_debug",
    lfunc.bindbyname(self, "setDebug"),
    "Set Invokation debugging (empty - print debug status, 0 - disabled, 1 - enabled)",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_dump_abilities",
    lfunc.bindbyname(self, "dumpAbilities"),
    "Dump current hero abilities (empty - verbose, 1 - simplified)",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_invoke",
    lfunc.bindbyname(self, "invokeAbility"),
    "Invoke an ability (<name:string>)",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_dump_combo_graph",
    lfunc.bindbyname(self, "dumpComboGraph"),
    "Dumps a combo's finite state machine in DOT format",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_music_status",
    lfunc.bindbyname(self, "changeMusicStatus"),
    "Change music status (<status:int> <intensity:float>)",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_dump_lua_version",
    lfunc.bindbyname(self, "dumpLuaVersion"),
    "Dump Lua version",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_dump_global",
    lfunc.bindbyname(self, "dumpGlobal"),
    "Dump global value (<name:string>)",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_find_global",
    lfunc.bindbyname(self, "findGlobal"),
    "Find global name (<pattern:regex>)",
    FCVAR_CHEAT
  )

  self:d("  register commands")
end

function GameMode:setDebug(_, arg)
  if arg == "1" then
    self.logger.level = Logger.DEBUG
  elseif arg == "0" then
    self.logger.level = Logger.INFO
  else
    print(string.format("inv_debug = %d", self.logger.level <= Logger.DEBUG and 1 or 0))
  end
end

local function debugAbility(a, simple)
  if a == nil then
    return nil
  end

  if simple then
    return {
      a:GetAbilityIndex(),
      a:GetAbilityName(),
      a:GetLevel(),
    }
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

function GameMode:dumpAbilities(_, simple)
  local player = Convars:GetDOTACommandClient()
  local hero = player:GetAssignedHero()

  for i = 0, hero:GetAbilityCount() - 1 do
    local a = hero:GetAbilityByIndex(i)
    self:d(i, debugAbility(a, simple))
  end
end

function GameMode:invokeAbility(_, ability)
  self:d("invokeAbility()", ability)

  local player = Convars:GetDOTACommandClient()
  local hero = player:GetAssignedHero()
  local invoker = Invoker(hero)

  invoker:Invoke(ability)
end

function GameMode:dumpComboGraph(_, comboName)
  local combo = self.combos:Find(comboName)

  if combo == nil then
    self:d("Could not find combo", comboName)
    return
  end

  print(combo:todot())
end

function GameMode:changeMusicStatus(_, status, intensity)
  local player = Convars:GetDOTACommandClient()

  status = tonumber(status)
  intensity = tonumber(intensity)

  player:SetMusicStatus(status, intensity)
end

function GameMode:dumpLuaVersion()
  print(_VERSION)
end

function GameMode:dumpGlobal(_, name)
  local value = _G

  for segment in name:gmatch("([^.]+)%.?") do
    value = value[segment]
  end

  local pp = require("pl.pretty")
  local typ = type(value)
  local repr = pp.write(value)

  print(string.format("%q (%s): %s", name, typ, repr))

  if typ == "function" then
    local info = debug.getinfo(value)
    print(string.format("source: %s:%d", info.source, info.linedefined))
  end
end

function GameMode:findGlobal(_, pattern)
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

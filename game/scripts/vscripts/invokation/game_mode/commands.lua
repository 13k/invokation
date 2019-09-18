--- Console Commands
-- @submodule invokation.GameMode

--- Console Commands
-- @section commands

local pp = require("pl.pretty")
local tablex = require("pl.tablex")
local Logger = require("invokation.Logger")
local Invoker = require("invokation.dota2.Invoker")
-- local Unit = require("invokation.dota2.Unit")
-- local Player = require("invokation.dota2.Player")

local COMMANDS = {
  {
    name = "inv_debug",
    method = "CommandSetDebug",
    help = "Set debugging (empty - print debug status, 0 - disabled, 1 - enabled)",
    flags = FCVAR_CHEAT,
    dev = false
  },
  {
    name = "inv_debug_misc",
    method = "CommandDebugMisc",
    help = "Run miscellaneous debug code (use script_reload to reload)",
    flags = FCVAR_CHEAT,
    dev = true
  },
  {
    name = "inv_dump_lua_version",
    method = "CommandDumpLuaVersion",
    help = "Dump Lua version",
    flags = FCVAR_CHEAT,
    dev = true
  },
  {
    name = "inv_dump_global",
    method = "CommandDumpGlobal",
    help = "Dump global value (<name:string>)",
    flags = FCVAR_CHEAT,
    dev = true
  },
  {
    name = "inv_find_global",
    method = "CommandFindGlobal",
    help = "Find global name (<pattern:regex>)",
    flags = FCVAR_CHEAT,
    dev = true
  },
  {
    name = "inv_item_query",
    method = "CommandItemQuery",
    help = "Query items (<query:string>)",
    flags = FCVAR_CHEAT,
    dev = true
  },
  {
    name = "inv_dump_abilities",
    method = "CommandDumpAbilities",
    help = "Dump current hero abilities ([simplified:int])",
    flags = FCVAR_CHEAT,
    dev = true
  },
  {
    name = "inv_invoke",
    method = "CommandInvokeAbility",
    help = "Invoke an ability (<name:string>)",
    flags = FCVAR_CHEAT,
    dev = true
  },
  {
    name = "inv_dump_combo_graph",
    method = "CommandDumpComboGraph",
    help = "Dumps a combo's finite state machine in DOT format",
    flags = FCVAR_CHEAT,
    dev = true
  },
  {
    name = "inv_music_status",
    method = "CommandChangeMusicStatus",
    help = "Change music status (<status:int> <intensity:float>)",
    flags = FCVAR_CHEAT,
    dev = true
  },
  {
    name = "inv_dump_ability_specials",
    method = "CommandDumpAbilitySpecials",
    help = "Dump Invoker ability specials ([onlyScaling:int])",
    flags = FCVAR_CHEAT,
    dev = true
  },
  {
    name = "inv_reinsert_ability",
    method = "CommandReinsertAbility",
    help = "Reinsert Invoker ability (<name:string>)",
    flags = FCVAR_CHEAT,
    dev = true
  }
}

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
-- @tparam "0"|"1"|nil arg `"1"` enables debugging; `"0"` disables debugging; `nil` prints debugging value
function GameMode:CommandSetDebug(player, arg) -- luacheck: no unused args
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
-- @tparam CDOTAPlayer player Player who issued this console command
-- @param[opt] ... varargs
function GameMode:CommandDebugMisc(player, ...) -- luacheck: no unused args
  -- local hero = Unit(player.hero)
end

--- Dumps Lua version.
-- @tparam CDOTAPlayer player Player who issued this console command
function GameMode:CommandDumpLuaVersion(player) -- luacheck: no unused args
  print(_VERSION)
end

--- Dumps global value.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string name Dot-separated value name
function GameMode:CommandDumpGlobal(player, name) -- luacheck: no unused args
  if not name then
    return
  end

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
function GameMode:CommandFindGlobal(player, pattern) -- luacheck: no unused args
  if not pattern then
    return
  end

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
function GameMode:CommandItemQuery(player, query) -- luacheck: no unused args
  if not query then
    return
  end

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
    return {
      a:GetAbilityIndex(),
      a:GetAbilityName(),
      a:GetLevel()
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
    channelTime = a:GetChannelTime()
  }
end

--- Dumps current hero abilities.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam[opt] string simple Simple version or verbose
function GameMode:CommandDumpAbilities(player, simple) -- luacheck: no unused args
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
function GameMode:CommandInvokeAbility(player, ability) -- luacheck: no unused args
  if not ability then
    return
  end

  local hero = player:GetAssignedHero()
  local invoker = Invoker(hero)

  invoker:Invoke(ability)
end

--- Dumps combo graph in DOT format.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string comboId Combo ID
function GameMode:CommandDumpComboGraph(player, comboId) -- luacheck: no unused args
  if not comboId then
    return
  end

  local combo = self.combos:createCombo(tonumber(comboId))

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
function GameMode:CommandChangeMusicStatus(player, status, intensity) -- luacheck: no unused args
  if not status or not intensity then
    return
  end

  status = tonumber(status)
  intensity = tonumber(intensity)

  player:SetMusicStatus(status, intensity)
end

--- Dumps Invoker ability specials values.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam[opt] string onlyScaling Dump only values that scale, ignoring fixed values
-- @todo Parse specials from ability KV and remove the hardcoded lists
function GameMode:CommandDumpAbilitySpecials(player, onlyScaling) -- luacheck: no unused args
  local hero = player:GetAssignedHero()
  local specials

  if onlyScaling then
    specials = {
      [Invoker.ABILITY_COLD_SNAP] = {
        "duration",
        "freeze_cooldown",
        "freeze_damage"
      },
      [Invoker.ABILITY_GHOST_WALK] = {
        "enemy_slow",
        "self_slow"
      },
      [Invoker.ABILITY_ICE_WALL] = {
        "duration",
        "slow",
        "damage_per_second"
      },
      [Invoker.ABILITY_EMP] = {
        "mana_burned"
      },
      [Invoker.ABILITY_TORNADO] = {
        "travel_distance",
        "lift_duration",
        "quas_damage",
        "wex_damage"
      },
      [Invoker.ABILITY_ALACRITY] = {
        "bonus_attack_speed",
        "bonus_damage"
      },
      [Invoker.ABILITY_SUN_STRIKE] = {
        "damage"
      },
      [Invoker.ABILITY_FORGE_SPIRIT] = {
        "spirit_damage",
        "spirit_mana",
        "spirit_armor",
        "spirit_attack_range",
        "spirit_hp",
        "spirit_duration"
      },
      [Invoker.ABILITY_CHAOS_METEOR] = {
        "travel_distance",
        "main_damage",
        "burn_dps"
      },
      [Invoker.ABILITY_DEAFENING_BLAST] = {
        "damage",
        "knockback_duration",
        "disarm_duration"
      }
    }
  else
    specials = {
      [Invoker.ABILITY_COLD_SNAP] = {
        "duration",
        "freeze_duration",
        "freeze_cooldown",
        "freeze_damage",
        "damage_trigger"
      },
      [Invoker.ABILITY_GHOST_WALK] = {
        "duration",
        "area_of_effect",
        "enemy_slow",
        "self_slow",
        "aura_fade_time"
      },
      [Invoker.ABILITY_ICE_WALL] = {
        "duration",
        "slow",
        "slow_duration",
        "damage_per_second",
        "wall_place_distance",
        "num_wall_elements",
        "wall_element_spacing",
        "wall_element_radius"
      },
      [Invoker.ABILITY_EMP] = {
        "delay",
        "area_of_effect",
        "mana_burned",
        "damage_per_mana_pct"
      },
      [Invoker.ABILITY_TORNADO] = {
        "travel_distance",
        "travel_speed",
        "area_of_effect",
        "vision_distance",
        "end_vision_duration",
        "lift_duration",
        "base_damage",
        "quas_damage",
        "wex_damage"
      },
      [Invoker.ABILITY_ALACRITY] = {
        "bonus_attack_speed",
        "bonus_damage",
        "duration"
      },
      [Invoker.ABILITY_SUN_STRIKE] = {
        "delay",
        "area_of_effect",
        "damage",
        "vision_distance",
        "vision_duration"
      },
      [Invoker.ABILITY_FORGE_SPIRIT] = {
        "spirit_damage",
        "spirit_mana",
        "spirit_armor",
        "spirit_attack_range",
        "spirit_hp",
        "spirit_duration"
      },
      [Invoker.ABILITY_CHAOS_METEOR] = {
        "land_time",
        "area_of_effect",
        "travel_distance",
        "travel_speed",
        "damage_interval",
        "vision_distance",
        "end_vision_duration",
        "main_damage",
        "burn_duration",
        "burn_dps"
      },
      [Invoker.ABILITY_DEAFENING_BLAST] = {
        "travel_distance",
        "travel_speed",
        "radius_start",
        "radius_end",
        "end_vision_duration",
        "damage",
        "knockback_duration",
        "disarm_duration"
      }
    }
  end

  for aName, sNames in pairs(specials) do
    local ability = hero:FindAbilityByName(aName)

    for _, sName in ipairs(sNames) do
      local t = ability:GetSpecialValueFor(sName)
      print(aName, sName, t)
    end
  end
end

--- Reinserts an ability into the current hero.
-- @tparam CDOTAPlayer player Player who issued this console command
-- @tparam string name Ability name
function GameMode:CommandReinsertAbility(player, name) -- luacheck: no unused args
  if not name then
    return
  end

  local hero = player:GetAssignedHero()
  local ability = hero:FindAbilityByName(name)
  local index = ability:GetAbilityIndex()
  local level = ability:GetLevel()

  hero:RemoveAbility(name)

  ability = hero:AddAbility(name)
  ability:SetAbilityIndex(index)
  ability:SetLevel(level)
end

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

  Convars:RegisterCommand(
    "inv_dump_ability_specials",
    lfunc.bindbyname(self, "dumpAbilitySpecials"),
    "Dump Invoker ability specials (empty - all specials, 1 - scaling per level specials only)",
    FCVAR_CHEAT
  )

  Convars:RegisterCommand(
    "inv_reinsert_ability",
    lfunc.bindbyname(self, "reinsertAbility"),
    "Reinsert Invoker ability (<name:string>)",
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

function GameMode:dumpAbilitySpecials(_, onlyScaling)
  local player = Convars:GetDOTACommandClient()
  local hero = player:GetAssignedHero()
  local specials

  if onlyScaling then
    specials = {
      [Invoker.ABILITY_COLD_SNAP] = {"duration", "freeze_cooldown", "freeze_damage"},
      [Invoker.ABILITY_GHOST_WALK] = {"enemy_slow", "self_slow"},
      [Invoker.ABILITY_ICE_WALL] = {"duration", "slow", "damage_per_second"},
      [Invoker.ABILITY_EMP] = {"mana_burned"},
      [Invoker.ABILITY_TORNADO] = {"travel_distance", "lift_duration", "quas_damage", "wex_damage"},
      [Invoker.ABILITY_ALACRITY] = {"bonus_attack_speed", "bonus_damage"},
      [Invoker.ABILITY_SUN_STRIKE] = {"damage"},
      [Invoker.ABILITY_FORGE_SPIRIT] = {"spirit_damage", "spirit_mana", "spirit_armor", "spirit_attack_range", "spirit_hp", "spirit_duration"},
      [Invoker.ABILITY_CHAOS_METEOR] = {"travel_distance", "main_damage", "burn_dps"},
      [Invoker.ABILITY_DEAFENING_BLAST] = {"damage", "knockback_duration", "disarm_duration"},
    }
  else
    specials = {
      [Invoker.ABILITY_COLD_SNAP] = {"duration", "freeze_duration", "freeze_cooldown", "freeze_damage", "damage_trigger"},
      [Invoker.ABILITY_GHOST_WALK] = {"duration", "area_of_effect", "enemy_slow", "self_slow", "aura_fade_time"},
      [Invoker.ABILITY_ICE_WALL] = {"duration", "slow", "slow_duration", "damage_per_second", "wall_place_distance", "num_wall_elements", "wall_element_spacing", "wall_element_radius"},
      [Invoker.ABILITY_EMP] = {"delay", "area_of_effect", "mana_burned", "damage_per_mana_pct"},
      [Invoker.ABILITY_TORNADO] = {"travel_distance", "travel_speed", "area_of_effect", "vision_distance", "end_vision_duration", "lift_duration", "base_damage", "quas_damage", "wex_damage"},
      [Invoker.ABILITY_ALACRITY] = {"bonus_attack_speed", "bonus_damage", "duration"},
      [Invoker.ABILITY_SUN_STRIKE] = {"delay", "area_of_effect", "damage", "vision_distance", "vision_duration"},
      [Invoker.ABILITY_FORGE_SPIRIT] = {"spirit_damage", "spirit_mana", "spirit_armor", "spirit_attack_range", "spirit_hp", "spirit_duration"},
      [Invoker.ABILITY_CHAOS_METEOR] = {"land_time", "area_of_effect", "travel_distance", "travel_speed", "damage_interval", "vision_distance", "end_vision_duration", "main_damage", "burn_duration", "burn_dps"},
      [Invoker.ABILITY_DEAFENING_BLAST] = {"travel_distance", "travel_speed", "radius_start", "radius_end", "end_vision_duration", "damage", "knockback_duration", "disarm_duration"},
    }
  end

  for aName, sNames in pairs(specials) do
    local ability = hero:FindAbilityByName(aName)

    for _, sName in ipairs(sNames) do
      local t = ability:GetSpecialValueFor(sName)
      self:d(aName, sName, t)
    end
  end
end

function GameMode:reinsertAbility(_, name)
  self:d("reinsertAbility()", name)

  local player = Convars:GetDOTACommandClient()
  local hero = player:GetAssignedHero()
  local ability = hero:FindAbilityByName(name)
  local index = ability:GetAbilityIndex()
  local level = ability:GetLevel()

  hero:RemoveAbility(name)

  ability = hero:AddAbility(name)
  ability:SetAbilityIndex(index)
  ability:SetLevel(level)
end

local class = require("middleclass")
local inspect = require("inspect")

local Ability = require("invk.dota2.ability")
local COMMANDS = require("invk.const.commands")
local CUSTOM_EVENTS = require("invk.const.custom_events")
local Combos = require("invk.combo.combos")
local DamageInstance = require("invk.dota2.damage_instance")
local Env = require("invk.game_mode.env")
local INVOKER = require("invk.const.invoker")
local Invoker = require("invk.dota2.invoker")
local ItemsKeyValues = require("invk.dota2.kv.items_key_values")
local Logger = require("invk.logger")
local META = require("invk.const.metadata")
local NET_TABLES = require("invk.const.net_table")
local NetTable = require("invk.dota2.net_table")
local PRECACHE = require("invk.const.precache")
local S = require("invk.const.settings")
local Timers = require("invk.dota2.timers")
local Unit = require("invk.dota2.unit")
local custom_ev = require("invk.dota2.custom_events")
local func = require("invk.lang.function")
local rand = require("invk.lang.random")
local tbl = require("invk.lang.table")

local LOGNAME = "invk"
local DEFAULT_ENV = Env.is_dev_mode() and Env.DEVELOPMENT or Env.PRODUCTION

--- Main class for the game.
--- @class invk.GameMode : middleclass.Class, invk.log.Mixin
--- @field env invk.Env
--- @field users { [integer]: CDOTAPlayerController? }
--- @field players { [PlayerID]: CDOTAPlayerController? }
--- @field items_kv invk.dota2.kv.ItemsKeyValues
--- @field net_tables { [invk.net_table.Name]: invk.dota2.NetTable }
--- @field combos invk.combo.Combos
--- @field logger invk.Logger
--- @field private game_mode CDOTABaseGameMode
--- @field private _reentrant boolean
--- @field private _first_player_loaded boolean
--- @field private _first_spawned boolean
local M = class("invk.GameMode")

M:include(Logger.Mixin)

M.META = META
M._VERSION = META.version

--- Precaches resources/units/items/abilities that will be needed for sure in
--- your game and that will not be precached by hero selection.
---
--- When a hero is selected from the hero selection screen, the game will
--- precache that hero's assets, any equipped cosmetics, and perform the
--- data-driven precaching defined in that hero's `precache{}` block, as well as
--- the `precache{}` block for any equipped abilities.
function M.precache(ctx)
  for _, name in ipairs(PRECACHE.UNITS) do
    PrecacheUnitByNameSync(name, ctx)
  end

  for path, ty in pairs(PRECACHE.RESOURCES) do
    PrecacheResource(ty, path, ctx)
  end
end

--- @class invk.GameModeOptions
--- @field env? invk.Env # Environment

--- Constructor.
--- @param options? invk.GameModeOptions # Options table
function M:initialize(options)
  local opts = options or {}

  self._reentrant = false
  self._first_player_loaded = false
  self._first_spawned = false

  self.env = opts.env or DEFAULT_ENV
  self.users = {}
  self.players = {}

  self.logger =
    Logger:new(LOGNAME, self.env == Env.DEVELOPMENT and Logger.Level.DEBUG or Logger.Level.INFO)

  self.items_kv = ItemsKeyValues:load()

  self.net_tables = tbl.map(NET_TABLES.Tables, function(config)
    return NetTable:new(config, { logger = self.logger })
  end)

  self.combos = Combos:new(self.net_tables[NET_TABLES.Name.MAIN], { logger = self.logger })
end

--- @param fn_name string
--- @return fun(...: any): any...
function M:fn_handler(fn_name)
  if self.env == Env.DEVELOPMENT then
    return func.lookupbyname(self, fn_name)
  end

  return self[fn_name]
end

--- @param method_name string
--- @return fun(...: any): any...
function M:method_handler(method_name)
  return func.bind(self:fn_handler(method_name), self)
end

--- Entry-point for the game initialization.
function M:activate()
  if M._reentrant then
    return
  end

  self:d("(addon) Activating...")

  self:setup_modules()
  self:setup_net_tables()
  self:setup_game_rules()
  self:setup_game_mode()
  self:register_game_events()
  self:register_custom_events()
  self:register_commands()
  self:register_convars()

  self:d("(addon) Done")
end

function M:setup_modules()
  self:d("  (timers) setup")
  Timers:start()

  self:d("  (random) seed")
  rand.seed()
end

--- Used to set up async precache calls at the beginning of the gameplay.
---
--- In this function, place all of your `PrecacheItemByNameAsync` and
--- `PrecacheUnitByNameAsync`. These calls will be made after all players have
--- loaded in, but before they have selected their heroes.
--- `PrecacheItemByNameAsync` can also be used to precache dynamically-added
--- datadriven abilities instead of items. `PrecacheUnitByNameAsync` will
--- precache the `precache{}` block statement of the unit and all `precache{}`
--- block statements for every `Ability#` defined on the unit.
---
--- This function should only be called once. If you want to/need to precache
--- more items/abilities/units at a later time, you can call the functions
--- individually (for example if you want to precache units in a new wave of
--- holdout).
---
--- This function should generally only be used if `Precache` is not working.
function M:post_load_precache()
  self:d("Performing Post-Load precache")
end

--- net_tables {{{

function M:setup_net_tables()
  self:d("  (net_tables) setup")

  -- main/hero_data
  do
    local net_table = self.net_tables[NET_TABLES.Name.MAIN]

    net_table:set(net_table.keys.HERO_DATA, INVOKER:serialize())
  end

  -- hero/key_values
  do
    local net_table = self.net_tables[NET_TABLES.Name.HERO]

    net_table:set(net_table.keys.KEY_VALUES, INVOKER.KEY_VALUES.data)
  end

  -- abilities/key_values
  do
    local net_table = self.net_tables[NET_TABLES.Name.ABILITIES]

    net_table:set(net_table.keys.KEY_VALUES, INVOKER.KEY_VALUES:abilities_data())
  end
end

--- }}}
--- game_rules {{{

function M:setup_game_rules()
  self:d("  (GameRules) setup")

  GameRules:SetCreepMinimapIconScale(S.MINIMAP_CREEP_ICON_SCALE)
  GameRules:SetCreepSpawningEnabled(S.ENABLE_CREEP_SPAWN)
  GameRules:SetCustomGameAllowBattleMusic(S.ENABLE_BATTLE_MUSIC)
  GameRules:SetCustomGameAllowHeroPickMusic(S.ENABLE_HERO_PICK_MUSIC)
  GameRules:SetCustomGameAllowMusicAtGameStart(S.ENABLE_GAME_START_MUSIC)
  GameRules:SetCustomGameEndDelay(S.GAME_END_DELAY)
  GameRules:SetCustomGameSetupRemainingTime(S.GAME_SETUP_TIME)
  GameRules:SetCustomGameSetupTimeout(S.GAME_SETUP_TIMEOUT)
  GameRules:SetCustomVictoryMessage(S.VICTORY_MESSAGE)
  GameRules:SetCustomVictoryMessageDuration(S.VICTORY_MESSAGE_DURATION)
  GameRules:SetFirstBloodActive(S.ENABLE_FIRST_BLOOD)
  GameRules:SetGoldPerTick(S.GOLD_PER_TICK)
  GameRules:SetGoldTickTime(S.GOLD_TICK_TIME)
  GameRules:SetHeroMinimapIconScale(S.MINIMAP_HERO_ICON_SCALE)
  GameRules:SetHeroRespawnEnabled(S.ENABLE_HERO_RESPAWN)
  GameRules:SetHeroSelectionTime(S.HERO_SELECTION_TIME)
  GameRules:SetHeroSelectPenaltyTime(S.HERO_SELECTION_PENALTY_TIME)
  GameRules:SetHideKillMessageHeaders(S.HIDE_KILL_BANNERS)
  GameRules:SetPostGameTime(S.POST_GAME_TIME)
  GameRules:SetPreGameTime(S.PRE_GAME_TIME)
  GameRules:SetRuneMinimapIconScale(S.MINIMAP_RUNE_ICON_SCALE)
  GameRules:SetRuneSpawnTime(S.RUNE_SPAWN_TIME)
  GameRules:SetSameHeroSelectionEnabled(S.ALLOW_SAME_HERO_SELECTION)
  GameRules:SetShowcaseTime(S.SHOWCASE_TIME)
  GameRules:SetStartingGold(S.STARTING_GOLD)
  GameRules:SetStrategyTime(S.STRATEGY_TIME)
  GameRules:SetTreeRegrowTime(S.TREE_REGROW_TIME)
  GameRules:SetUseBaseGoldBountyOnHeroes(S.USE_BASE_HERO_GOLD_BOUNTY)
  GameRules:SetUseCustomHeroXPValues(S.USE_CUSTOM_XP_VALUES)
  GameRules:SetUseUniversalShopMode(S.UNIVERSAL_SHOP_MODE)

  if self.env == Env.DEVELOPMENT then
    GameRules:EnableCustomGameSetupAutoLaunch(true)
    GameRules:LockCustomGameSetupTeamAssignment(true)
    GameRules:SetCustomGameSetupAutoLaunchDelay(0)
  else
    GameRules:EnableCustomGameSetupAutoLaunch(S.ENABLE_AUTO_LAUNCH)
    GameRules:LockCustomGameSetupTeamAssignment(S.LOCK_TEAM_SETUP)
    GameRules:SetCustomGameSetupAutoLaunchDelay(S.AUTO_LAUNCH_DELAY)
  end

  for team, number in pairs(S.CUSTOM_TEAM_PLAYER_COUNT) do
    GameRules:SetCustomGameTeamMaxPlayers(team, number)
  end

  if S.USE_CUSTOM_TEAM_COLORS then
    for team, color in pairs(S.TEAM_COLORS) do
      SetTeamCustomHealthbarColor(team, color[1], color[2], color[3])
    end
  end

  -- Sets a callback to handle saving custom game account records (callback is
  -- passed a player id and should return a flat simple table) [Preview/Unreleased]
  -- GameRules:SetCustomGameAccountRecordSaveFunction(handle, handle)
end

--- }}}
--- game_mode {{{

function M:setup_game_mode()
  self:d("  (GameMode) setup")

  self.game_mode = GameRules:GetGameModeEntity()

  self.game_mode:SetAlwaysShowPlayerInventory(S.ALWAYS_SHOW_PLAYER_INVENTORY)
  self.game_mode:SetAlwaysShowPlayerNames(S.ALWAYS_SHOW_PLAYER_NAMES)
  self.game_mode:SetAnnouncerDisabled(S.DISABLE_ANNOUNCER)
  self.game_mode:SetBotThinkingEnabled(S.USE_STANDARD_DOTA_BOT_THINKING)
  self.game_mode:SetBotsAlwaysPushWithHuman(S.BOTS_ALWAYS_PUSH_WITH_HUMAN)
  self.game_mode:SetBotsInLateGame(S.BOTS_LATE_GAME_BEHAVIOR)
  self.game_mode:SetBotsMaxPushTier(S.BOTS_MAX_PUSH_TIER)
  self.game_mode:SetBountyRuneSpawnInterval(S.BOUNTY_RUNE_SPAWN_INTERVAL)
  self.game_mode:SetBuybackEnabled(S.BUYBACK_ENABLED)
  self.game_mode:SetCameraDistanceOverride(S.CAMERA_DISTANCE_OVERRIDE)
  self.game_mode:SetCameraSmoothCountOverride(S.CAMERA_SMOOTH_COUNT)
  self.game_mode:SetCustomBackpackCooldownPercent(S.CUSTOM_BACKPACK_COOLDOWN_PERCENT)
  self.game_mode:SetCustomBackpackSwapCooldown(S.CUSTOM_BACKPACK_SWAP_COOLDOWN)
  self.game_mode:SetCustomBuybackCooldownEnabled(S.CUSTOM_BUYBACK_COOLDOWN_ENABLED)
  self.game_mode:SetCustomBuybackCostEnabled(S.CUSTOM_BUYBACK_COST_ENABLED)
  self.game_mode:SetCustomGlyphCooldown(S.CUSTOM_GLYPH_COOLDOWN)
  self.game_mode:SetCustomScanCooldown(S.CUSTOM_SCAN_COOLDOWN)
  self.game_mode:SetDaynightCycleDisabled(S.DISABLE_DAY_NIGHT_CYCLE)
  self.game_mode:SetDeathOverlayDisabled(S.DISABLE_DEATH_OVERLAY)
  self.game_mode:SetDraftingBanningTimeOverride(S.DRAFTING_BANNING_TIME)
  self.game_mode:SetDraftingHeroPickSelectTimeOverride(S.DRAFTING_HERO_PICK_SELECTION_TIME)
  self.game_mode:SetFixedRespawnTime(S.FIXED_RESPAWN_TIME)
  self.game_mode:SetFogOfWarDisabled(S.DISABLE_FOG_OF_WAR)
  self.game_mode:SetFountainConstantManaRegen(S.FOUNTAIN_CONSTANT_MANA_REGEN)
  self.game_mode:SetFountainPercentageHealthRegen(S.FOUNTAIN_PERCENTAGE_HEALTH_REGEN)
  self.game_mode:SetFountainPercentageManaRegen(S.FOUNTAIN_PERCENTAGE_MANA_REGEN)
  self.game_mode:SetFriendlyBuildingMoveToEnabled(S.ENABLE_FRIENDLY_BUILDING_MOVE_TO_CLICK)
  self.game_mode:SetGoldSoundDisabled(S.DISABLE_GOLD_SOUNDS)
  self.game_mode:SetHudCombatEventsDisabled(S.DISABLE_COMBAT_EVENTS_HUD)
  self.game_mode:SetKillingSpreeAnnouncerDisabled(S.DISABLE_KILLING_SPREE_ANNOUNCER)
  self.game_mode:SetLoseGoldOnDeath(S.LOSE_GOLD_ON_DEATH)
  self.game_mode:SetMaximumAttackSpeed(S.MAXIMUM_ATTACK_SPEED)
  self.game_mode:SetMinimumAttackSpeed(S.MINIMUM_ATTACK_SPEED)
  self.game_mode:SetPauseEnabled(S.ENABLE_PAUSE)
  self.game_mode:SetPowerRuneSpawnInterval(S.POWER_RUNE_SPAWN_INTERVAL)
  self.game_mode:SetRecommendedItemsDisabled(S.RECOMMENDED_BUILDS_DISABLED)
  self.game_mode:SetRemoveIllusionsOnDeath(S.REMOVE_ILLUSIONS_ON_DEATH)
  self.game_mode:SetRespawnTimeScale(S.RESPAWN_TIME_SCALE)
  self.game_mode:SetSelectionGoldPenaltyEnabled(S.ENABLE_SELECTION_GOLD_PENALTY)
  self.game_mode:SetStashPurchasingDisabled(S.DISABLE_STASH_PURCHASING)
  self.game_mode:SetStickyItemDisabled(S.DISABLE_STICKY_ITEM)
  self.game_mode:SetTopBarTeamValuesOverride(S.USE_CUSTOM_TOP_BAR_VALUES)
  self.game_mode:SetTopBarTeamValuesVisible(S.TOP_BAR_VISIBLE)
  self.game_mode:SetTowerBackdoorProtectionEnabled(S.ENABLE_TOWER_BACKDOOR_PROTECTION)
  self.game_mode:SetUnseenFogOfWarEnabled(S.USE_UNSEEN_FOG_OF_WAR)
  self.game_mode:SetUseDefaultDOTARuneSpawnLogic(S.USE_DEFAULT_DOTA_RUNE_SPAWN_LOGIC)
  self.game_mode:SetWeatherEffectsDisabled(S.DISABLE_WEATHER_EFFECTS)

  -- Must be set before `SetUseCustomHeroLevels`
  self.game_mode:SetCustomXPRequiredToReachNextLevel(S.XP_PER_LEVEL_TABLE)
  self.game_mode:SetUseCustomHeroLevels(S.USE_CUSTOM_HERO_LEVELS)

  -- self.gameMode:SetCustomAttributeDerivedStatValue(nStatType, flNewValue)
  -- self.gameMode:SetHUDVisible(iHUDElement, bVisible)
  -- self.gameMode:SetKillableTombstones(S.KILLABLE_TOMBSTONES)
  -- self.gameMode:SetTopBarTeamValue(iTeam, nValue)

  if S.FORCE_PICKED_HERO ~= nil then
    self.game_mode:SetCustomGameForceHero(S.FORCE_PICKED_HERO)
  end

  if S.CUSTOM_TERRAIN_WEATHER_EFFECT ~= nil then
    self.game_mode:SetCustomTerrainWeatherEffect(S.CUSTOM_TERRAIN_WEATHER_EFFECT)
  end

  for rune, spawn in pairs(S.ENABLED_RUNES) do
    self.game_mode:SetRuneEnabled(rune, spawn)
  end
end

--- }}}
--- events {{{

--- @param event string
--- @param method_name string
--- @return EventListenerID
function M:listen_to_game_event(event, method_name)
  return ListenToGameEvent(event, self:fn_handler(method_name), self)
end

--- @param event string
--- @param method_name string
--- @return CustomGameEventListenerID
function M:subscribe_to_custom_event(event, method_name)
  return custom_ev.subscribe(event, self:method_handler(method_name))
end

function M:register_game_events()
  self:d("  (game_events) register listeners")

  self:listen_to_game_event("dota_ability_channel_finished", "OnAbilityChannelFinished")
  self:listen_to_game_event("dota_item_purchased", "OnItemPurchased")
  self:listen_to_game_event("dota_non_player_used_ability", "OnNonPlayerUsedAbility")
  self:listen_to_game_event("dota_player_begin_cast", "OnAbilityCastBegins")
  self:listen_to_game_event("dota_player_used_ability", "OnAbilityUsed")
  self:listen_to_game_event("entity_hurt", "OnEntityHurt")
  self:listen_to_game_event("entity_killed", "_OnEntityKilled")
  self:listen_to_game_event("game_rules_state_change", "_OnGameRulesStateChange")
  self:listen_to_game_event("npc_spawned", "_OnNPCSpawned")
  self:listen_to_game_event("player_connect_full", "_OnConnectFull")
end

function M:register_custom_events()
  self:d("  (custom_events) register listeners")

  self:subscribe_to_custom_event(CUSTOM_EVENTS.EVENT_PLAYER_QUIT_REQUEST, "OnPlayerQuitRequest")
  self:subscribe_to_custom_event(CUSTOM_EVENTS.EVENT_COMBOS_RELOAD, "OnCombosReload")
  self:subscribe_to_custom_event(CUSTOM_EVENTS.EVENT_COMBOS_RELOAD, "OnCombosReload")
  self:subscribe_to_custom_event(CUSTOM_EVENTS.EVENT_COMBO_START, "OnComboStart")
  self:subscribe_to_custom_event(CUSTOM_EVENTS.EVENT_COMBO_STOP, "OnComboStop")
  self:subscribe_to_custom_event(CUSTOM_EVENTS.EVENT_COMBO_RESTART, "OnComboRestart")
  self:subscribe_to_custom_event(
    CUSTOM_EVENTS.EVENT_FREESTYLE_HERO_LEVEL_UP,
    "OnFreestyleHeroLevelUp"
  )

  self:subscribe_to_custom_event(
    CUSTOM_EVENTS.EVENT_COMBAT_LOG_CAPTURE_START,
    "OnCombatLogCaptureStart"
  )

  self:subscribe_to_custom_event(
    CUSTOM_EVENTS.EVENT_COMBAT_LOG_CAPTURE_STOP,
    "OnCombatLogCaptureStop"
  )
  self:subscribe_to_custom_event(CUSTOM_EVENTS.EVENT_ITEM_PICKER_QUERY_REQUEST, "OnItemPickerQuery")
end

-- events.internal {{{

local WARNF_MISSING_TEAM_COLOR =
  "Attempted to set custom player color for player %d and team %d, but the team color is not configured."

--- Called when the overall game state has changed.
--- @param payload dota2.events.game_rules_state_change
function M:_OnGameRulesStateChange(payload)
  if self._reentrant then
    return
  end

  local state = GameRules:State_Get()

  self._reentrant = true
  self:OnGameRulesStateChange(state, payload)
  self._reentrant = false

  if state == DOTA_GAMERULES_STATE_HERO_SELECTION then
    self:post_load_precache()
    self:OnAllPlayersLoaded()

    if S.USE_CUSTOM_TEAM_COLORS_FOR_PLAYERS then
      for i = 0, DOTA_DEFAULT_MAX_TEAM_PLAYERS do
        if PlayerResource:IsValidPlayer(i) then
          local team = PlayerResource:GetTeam(i)
          local color = S.TEAM_COLORS[team]

          if color ~= nil then
            PlayerResource:SetCustomPlayerColor(i, color[1], color[2], color[3])
          else
            self:warnf(WARNF_MISSING_TEAM_COLOR, i, team)
          end
        end
      end
    end
  elseif state == DOTA_GAMERULES_STATE_GAME_IN_PROGRESS then
    self:OnGameInProgress()
  end
end

--- Called once when the player fully connects and becomes "Ready" during loading.
--- @param payload dota2.events.player_connect_full
function M:_OnConnectFull(payload)
  self:d("_OnConnectFull", { payload = payload })

  if self._reentrant then
    return
  end

  local player = assertf(
    PlayerResource:GetPlayer(payload.PlayerID),
    "received invalid player ID from event payload %s",
    inspect(payload)
  )

  self._reentrant = true
  self:OnConnectFull(player, payload.userid)
  self._reentrant = false

  if not self._first_player_loaded then
    self._first_player_loaded = true
    self:OnFirstPlayerLoaded()
  end
end

--- Called when an NPC has spawned somewhere in game, including heroes.
--- @param payload dota2.events.npc_spawned
function M:_OnNPCSpawned(payload)
  self:d("_OnNPCSpawned", { payload = payload })

  if self._reentrant then
    return
  end

  local npc = EntIndexToHScript(payload.entindex) --[[@as CDOTA_BaseNPC?]]

  if npc ~= nil and npc:IsRealHero() and not self._first_spawned then
    self._first_spawned = true
    self:OnHeroInGame(npc)
  end
end

--- Called when an entity was killed.
--- @param payload dota2.events.entity_killed
function M:_OnEntityKilled(payload)
  self:d("_OnEntityKilled", { payload = payload })

  if self._reentrant then
    return
  end

  local killed = EntIndexToHScript(payload.entindex_killed)
  local attacker = nil
  local inflictor = nil

  if payload.entindex_attacker ~= nil then
    attacker = EntIndexToHScript(payload.entindex_attacker)
  end

  if payload.entindex_inflictor ~= nil then
    inflictor = EntIndexToHScript(payload.entindex_inflictor)
  end

  self._reentrant = true
  self:OnEntityKilled(killed, attacker, inflictor)
  self._reentrant = false
end

-- }}}
-- events.game {{{

local ERRF_ABILITY_OR_ITEM_NOT_FOUND = "Could not find ability or item named %q on unit %q"

--- The overall game state has changeds.
--- @param state DOTA_GameState
--- @param payload table
function M:OnGameRulesStateChange(state, payload)
  self:d("OnGameRulesStateChange", { state = state, payload = payload })
end

--- Called once when the player fully connects and becomes "Ready" during loading.
--- @param player CDOTAPlayerController
--- @param user_id integer
function M:OnConnectFull(player, user_id)
  self:d("OnConnectFull", { player = player:GetPlayerID() })

  self.users[user_id] = player
  self.players[player:GetPlayerID()] = player
end

--- Called once and only once as soon as the first player (almost certain to be
--- the server in local lobbies) loads in.
---
--- It can be used to initialize state that isn't initializeable in @{Activate}
--- but needs to be done before everyone loads in.
function M:OnFirstPlayerLoaded()
  self:d("OnFirstPlayerLoaded")
end

--- Called once and only once after all players have loaded into the game,
--- right as the hero selection time begins.
---
--- It can be used to initialize non-hero player state or adjust the hero
--- selection (i.e. force random etc)
function M:OnAllPlayersLoaded()
  self:d("OnAllPlayersLoaded")
end

--- Called once and only once for every player when they spawn into the game
--- for the first time.
---
--- It is also called if the player's hero is replaced with a new hero for any
--- reason. This function is useful for initializing heroes, such as adding
--- levels, changing the starting gold, removing/adding abilities, adding
--- physics, etc.
---
--- @param hero CDOTA_BaseNPC_Hero
function M:OnHeroInGame(hero)
  self:d("OnHeroInGame", { hero = hero:GetUnitName() })

  local player_id = hero:GetPlayerID()
  local player =
    assertf(PlayerResource:GetPlayer(player_id), "received invalid player id %d", player_id)

  local payload = {
    id = hero:GetHeroID(),
    name = hero:GetUnitName(),
    variant = hero:GetHeroFacetID(),
  }

  custom_ev.send_player(CUSTOM_EVENTS.EVENT_PLAYER_HERO_IN_GAME, player, payload)
end

--- Called once and only once when the game completely begins (about 0:00 on the clock).
function M:OnGameInProgress()
  self:d("OnGameInProgress")
end

--- An entity has been hurt.
--- @param payload dota2.events.entity_hurt
function M:OnEntityHurt(payload)
  self:d("OnEntityHurt", { payload = payload })

  local attacker
  local inflictor
  local victim = Unit:new(EntIndexToHScript(payload.entindex_killed))

  if payload.entindex_attacker ~= nil then
    attacker = Unit:new(EntIndexToHScript(payload.entindex_attacker))
  end

  -- FIXME: This is a hack to fix an issue when an entity is killed with `ForceKill`,
  -- FIXME: which will trigger this event. I'm not sure which enum `damagebits` is using,
  -- FIXME: but regular damage seems to always set it to 0 while `ForceKill` sets it to 4096
  if payload.entindex_inflictor ~= nil and payload.damagebits == 0 then
    inflictor = Ability:new(EntIndexToHScript(payload.entindex_inflictor))
  end

  local damage = DamageInstance:new(victim, payload.damage, attacker, inflictor)

  self.combos:on_entity_hurt(damage)
end

--- An item was purchased by a player.
--- @param payload dota2.events.dota_item_purchased
function M:OnItemPurchased(payload)
  self:d("OnItemPurchased", { payload = payload })

  local player = assertf(
    PlayerResource:GetPlayer(payload.PlayerID),
    "received invalid player ID from event payload %s",
    inspect(payload)
  )

  self.combos:on_item_purchased(player, {
    item = payload.itemname,
    cost = payload.itemcost,
  })
end

--- Called whenever an ability begins its PhaseStart phase (but before it is actually cast).
--- @param payload dota2.events.dota_player_begin_cast
function M:OnAbilityCastBegins(payload)
  self:d("OnAbilityCastBegins", { payload = payload })
end

--- An ability was used by a player (including items).
--- @param payload dota2.events.dota_player_used_ability
function M:OnAbilityUsed(payload)
  self:d("OnAbilityUsed", { payload = payload })

  local player = assertf(
    PlayerResource:GetPlayer(payload.PlayerID),
    "received invalid player ID from event payload %s",
    inspect(payload)
  )

  local caster = Unit:new(EntIndexToHScript(payload.caster_entindex))
  local ability_ent = caster:find_ability_or_item(payload.abilityname)

  if ability_ent == nil then
    errorf(ERRF_ABILITY_OR_ITEM_NOT_FOUND, payload.abilityname, caster.name)
  end

  local ability = Ability:new(ability_ent)

  self.combos:on_ability_used(player, caster, ability)
end

--- A non-player entity (necro-book, chen creep, etc) used an ability.
--- @param payload dota2.events.dota_non_player_used_ability
function M:OnNonPlayerUsedAbility(payload)
  self:d("OnNonPlayerUsedAbility", { payload = payload })
end

--- A channelled ability finished by either completing or being interrupted.
--- @param payload dota2.events.dota_ability_channel_finished
function M:OnAbilityChannelFinished(payload)
  self:d("OnAbilityChannelFinished", { payload = payload })
end

--- An entity died.
-- @tparam CDOTA_BaseNPC killed Killed unit
-- @tparam[opt] CDOTA_BaseNPC attacker Attacker unit
-- @tparam[opt] CDOTABaseAbility inflictor Inflictor ability
function M:OnEntityKilled(killed, attacker, inflictor)
  self:d("OnEntityKilled", {
    killed = killed:GetName(),
    attacker = attacker and attacker:GetName(),
    inflictor = inflictor and inflictor:GetName(),
  })
end

-- }}}
-- events.custom {{{

--- Handles player quit request events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.PlayerQuitRequest
function M:OnPlayerQuitRequest(player, payload)
  self:d("OnPlayerQuitRequest", { player = player:GetPlayerID(), payload = payload })

  SendToServerConsole("disconnect")
end

--- Handles combos reload events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.CombosReloadPayload
function M:OnCombosReload(player, payload)
  self:d("OnCombosReload", { player = player:GetPlayerID(), payload = payload })
  self.combos:load()
end

--- Handles combo start events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.ComboStartPayload
function M:OnComboStart(player, payload)
  self:d("OnComboStart", { player = player:GetPlayerID(), payload = payload })

  local combo = self.combos:create(payload.id)

  self.combos:on_start(player, combo)
end

--- Handles combo stop events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.ComboStopPayload
function M:OnComboStop(player, payload)
  self:d("OnComboStop", { player = player:GetPlayerID(), payload = payload })

  self.combos:on_stop(player)
end

--- Handles combo restart events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.ComboRestartPayload
function M:OnComboRestart(player, payload)
  self:d("OnComboRestart", { player = player:GetPlayerID(), payload = payload })

  --- @type invk.combo.hero.TeardownOptions
  local options = { hard_reset = payload.hardReset == 1 }

  self.combos:on_restart(player, options)
end

--- Handles freestyle hero level up events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.FreestyleHeroLevelUpPayload
function M:OnFreestyleHeroLevelUp(player, payload)
  self:d("OnFreestyleHeroLevelUp", { player = player:GetPlayerID(), payload = payload })

  local options = {
    level = payload.level,
    max_level = payload.maxLevel == 1,
  }

  self.combos:freestyle_hero_level_up(player, options)
end

--- Handles combat log capture start events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.CombatLogCaptureStartPayload
function M:OnCombatLogCaptureStart(player, payload)
  self:d("OnCombatLogCaptureStart", { player = player:GetPlayerID(), payload = payload })

  self.combos:start_capturing_abilities(player)
end

--- Handles combat log capture stop events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.CombatLogCaptureStopPayload
function M:OnCombatLogCaptureStop(player, payload)
  self:d("OnCombatLogCaptureStop", { player = player:GetPlayerID(), payload = payload })

  self.combos:stop_capturing_abilities(player)
end

--- Handles item picker query events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.ItemPickerQueryPayload
function M:OnItemPickerQuery(player, payload)
  self:d("OnItemPickerQuery", { player = player:GetPlayerID(), payload = payload })

  local response = { items = self.items_kv:search(payload.query) }

  custom_ev.send_player(CUSTOM_EVENTS.EVENT_ITEM_PICKER_QUERY_RESPONSE, player, response)
end

-- }}}

--- }}}
--- commands {{{

--- @param method_name string
function M:command_handler(method_name)
  return function(command, ...)
    self:d(command, method_name, ...)

    local callback = self:method_handler(method_name)
    local pawn = Convars:GetDOTACommandClient() --[[@as CBasePlayerPawn]]
    local player = pawn:GetController()

    return callback(player, ...)
  end
end

--- @param cmd invk.game_mode.ConsoleCommmand
function M:register_command(cmd)
  Convars:RegisterCommand(cmd.name, self:command_handler(cmd.method), cmd.help, cmd.flags or 0)
end

function M:register_commands()
  self:d("  (commands) register commands")

  for _, cmd in ipairs(COMMANDS) do
    if not cmd.dev or (cmd.dev and self.env == Env.DEVELOPMENT) then
      self:register_command(cmd)
    end
  end
end

--- Sets debugging on/off.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param arg? string # `"1"`: enables debugging, `"0"`: disables debugging, `nil`: prints debugging value.
function M:CommandSetDebug(_player, arg)
  if arg == "1" then
    self.logger.level = Logger.Level.DEBUG
  elseif arg == "0" then
    self.logger.level = Logger.Level.INFO
  else
    print(F("inv_debug = %d", self.logger.level <= Logger.Level.DEBUG and 1 or 0))
  end
end

--- Placeholder command to run miscellaneous debug code.
---
--- Use `script_reload` to reload after changes.
---
--- @param player CDOTAPlayerController # Player who issued this console command.
--- @param ... any
function M:CommandDebugMisc(player, ...)
  local cmd = require("invk.game_mode.commands.debug_misc")

  cmd.run(self, player, ...)
end

--- Dumps Lua version.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @diagnostic disable-next-line: unused
function M:CommandDumpLuaVersion(_player)
  print(_VERSION)
end

--- Dumps global value.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param name string # Dot-separated value name
--- @diagnostic disable-next-line: unused
function M:CommandDumpGlobal(_player, name)
  if not name then
    error("Argument <name> is required")
  end

  local cmd = require("invk.game_mode.commands.globals")

  cmd.dump(name)
end

--- Searches a global value.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param pattern string # Name pattern (uses `string.match` for matching)
--- @diagnostic disable-next-line: unused
function M:CommandFindGlobal(_player, pattern)
  if not pattern then
    error("Argument <pattern> is required")
  end

  local cmd = require("invk.game_mode.commands.globals")

  cmd.find(pattern)
end

--- Queries items.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param query string # Query string
function M:CommandItemQuery(_player, query)
  if not query then
    error("Argument <query> is required")
  end

  local cmd = require("invk.game_mode.commands.item")

  cmd.query(self, query)
end

--- Dumps current hero abilities.
--- @param player CDOTAPlayerController # Player who issued this console command
--- @param simple? string # Simple version or verbose
--- @diagnostic disable-next-line: unused
function M:CommandDumpAbilities(player, simple)
  local cmd = require("invk.game_mode.commands.dump_abilities")

  cmd.run(player, simple ~= nil)
end

--- Invokes ability by name.
--- @param player CDOTAPlayerController # Player who issued this console command
--- @param ability string # Ability name
--- @diagnostic disable-next-line: unused
function M:CommandInvokeAbility(player, ability)
  if not ability then
    error("Argument <ability> is required")
  end

  local hero = player:GetAssignedHero()
  local invoker = Invoker:new(hero)

  invoker:invoke(ability)
end

--- Dumps combo graph in DOT format.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param id string # Combo id
function M:CommandDumpComboGraph(_player, id)
  if not id then
    error("Argument <combo_id> is required")
  end

  local cmd = require("invk.game_mode.commands.combo")

  cmd.todot(self, id)
end

--- Changes music status.
--- @param player CDOTAPlayerController # Player who issued this console command
--- @param status string # Music status
--- @param intensity string # Music intensity
--- @diagnostic disable-next-line: unused
function M:CommandChangeMusicStatus(player, status, intensity)
  if not status or not intensity then
    error("Arguments <status> and <intensity> are required")
  end

  local cmd = require("invk.game_mode.commands.music")

  cmd.set_status(player, status, intensity)
end

--- Dumps Invoker ability specials values.
--- @param player CDOTAPlayerController # Player who issued this console command
--- @param only_scaling? string # Dump only values that scale, ignoring fixed values
--- @diagnostic disable-next-line: unused
function M:CommandDumpSpecials(player, only_scaling)
  local cmd = require("invk.game_mode.commands.dump_specials")

  cmd.dump(player, { only_scaling = (only_scaling ~= nil) })
end

--- Debug operations on ability specials KeyValues.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param op string # Operation name (`dump`, `find_keys`, `find_values`)
--- @param query string # Operation query (dump: path, findKeys: pattern, findValues: pattern)
--- @diagnostic disable-next-line: unused
function M:CommandDebugSpecials(_player, op, query)
  local cmd = require("invk.game_mode.commands.debug_specials")

  if op == "dump" then
    cmd.dump(query)
  elseif op == "find_keys" then
    cmd.find_keys(query)
  elseif op == "find_values" then
    cmd.find_values(query)
  else
    errorf("Invalid op %q", op)
  end
end

--- Reinserts an ability into the current hero.
--- @param player CDOTAPlayerController # Player who issued this console command
--- @param name string # Ability name
--- @diagnostic disable-next-line: unused
function M:CommandReinsertAbility(player, name)
  if not name then
    error("Argument <name> is required")
  end

  local cmd = require("invk.game_mode.commands.ability")

  cmd.reinsert(player, name)
end

--- }}}
--- convars {{{

function M:register_convars()
  self:d("  (convars) register convars")
end

--- }}}

return M

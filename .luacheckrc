exclude_files = {
  "game/scripts/vscripts/moses.lua",
  "game/scripts/vscripts/pl/**/*.lua"
}

new_globals = {
  "Precache",
  "Activate",
  "GameRules",
  "GameMode"
}

-- https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools/Scripting/API
new_read_globals = {
  ---- globals
  "AddFOWViewer",
  "AngleDiff",
  "AppendToLogFile",
  "ApplyDamage",
  "AxisAngleToQuaternion",
  "CalcClosestPointOnEntityOBB",
  "CalcDistanceBetweenEntityOBB",
  "CalcDistanceToLineSegment2D",
  "CancelEntityIOEvents",
  "ClearTeamCustomHealthbarColor",
  "CreateEffect",
  "CreateHeroForPlayer",
  "CreateHTTPRequestScriptVM",
  "CreateItem",
  "CreateItemOnPositionForLaunch",
  "CreateItemOnPositionSync",
  "CreateModifierThinker",
  "CreateTempTree",
  "CreateTrigger",
  "CreateTriggerRadiusApproximate",
  "CreateUnitByName",
  "CreateUnitByNameAsync",
  "CreateUnitFromTable",
  "cvar_getf",
  "cvar_setf",
  "DebugBreak",
  "DebugDrawBox",
  "DebugDrawBoxDirection",
  "DebugDrawCircle",
  "DebugDrawClear",
  "DebugDrawLine_vCol",
  "DebugDrawLine",
  "DebugDrawScreenTextLine",
  "DebugDrawSphere",
  "DebugDrawText",
  "DebugScreenTextPretty",
  "DoCleaveAttack",
  "EntFire",
  "EntFireByHandle",
  "ScriptAssert",
  "UniqueString",
  "Dynamic_Wrap",
  "EmitAnnouncerSound",
  "EmitAnnouncerSoundForPlayer",
  "EmitAnnouncerSoundForTeam",
  "EmitAnnouncerSoundForTeamOnLocation",
  "EmitGlobalSound",
  "EmitSoundOn",
  "EmitSoundOnClient",
  "EmitSoundOnLocationForAllies",
  "EmitSoundOnLocationWithCaster",
  "EntIndexToHScript",
  "ExecuteOrderFromTable",
  "ExponentialDecay",
  "FileToString",
  "FindClearSpaceForUnit",
  "FindUnitsInLine",
  "FindUnitsInRadius",
  "FireEntityIOInputNameOnly",
  "FireEntityIOInputString",
  "FireEntityIOInputVec",
  "FireGameEvent",
  "FireGameEventLocal",
  "FrameTime",
  "GetEntityIndexForTreeId",
  "GetFrameCount",
  "GetFrostyBoostAmount",
  "GetFrostyPointsForRound",
  "GetGoldFrostyBoostAmount",
  "GetGoldFrostyPointsForRound",
  "GetGroundHeight",
  "GetGroundPosition",
  "GetItemCost",
  "GetListenServerHost",
  "GetMapName",
  "GetMaxOutputDelay",
  "GetPhysAngularVelocity",
  "GetPhysVelocity",
  "GetSystemDate",
  "GetSystemTime",
  "GetTeamHeroKills",
  "GetTeamName",
  "GetTreeIdForEntityIndex",
  "GetWorldMaxX",
  "GetWorldMaxY",
  "GetWorldMinX",
  "GetWorldMinY",
  "InitLogFile",
  "IsClient",
  "IsDedicatedServer",
  "IsInToolsMode",
  "IsMarkedForDeletion",
  "IsServer",
  "IsValidEntity",
  "LimitPathingSearchDepth",
  "LinkLuaModifier",
  "ListenToGameEvent",
  "LoadKeyValues",
  "LoadKeyValuesFromString",
  "MakeStringToken",
  "MinimapEvent",
  "Msg",
  "PauseGame",
  "PlayerInstanceFromIndex",
  "PrecacheEntityFromTable",
  "PrecacheEntityListFromTable",
  "PrecacheItemByNameAsync",
  "PrecacheItemByNameSync",
  "PrecacheModel",
  "PrecacheResource",
  "PrecacheUnitByNameAsync",
  "PrecacheUnitByNameSync",
  "PrintLinkedConsoleMessage",
  "RandomFloat",
  "RandomInt",
  "RandomVector",
  "RegisterSpawnGroupFilterProxy",
  "ReloadMOTD",
  "RemoveSpawnGroupFilterProxy",
  "ResolveNPCPositions",
  "RollPercentage",
  "RotateOrientation",
  "RotatePosition",
  "RotateQuaternionByAxisAngle",
  "RotationDelta",
  "RotationDeltaAsAngularVelocity",
  "rr_AddDecisionRule",
  "rr_CommitAIResponse",
  "rr_GetResponseTargets",
  "rr_QueryBestResponse",
  "Say",
  "ScreenShake",
  "SendFrostivusTimeElapsedToGC",
  "SendFrostyPointsMessageToGC",
  "SendOverheadEventMessage",
  "SendToConsole",
  "SendToServerConsole",
  "SetOpvarFloatAll",
  "SetOpvarFloatPlayer",
  "SetPhysAngularVelocity",
  "SetQuestName",
  "SetQuestPhase",
  "SetRenderingEnabled",
  "SetTeamCustomHealthbarColor",
  "ShowCustomHeaderMessage",
  "ShowGenericPopup",
  "ShowGenericPopupToPlayer",
  "ShowMessage",
  "SpawnEntityFromTableSynchronous",
  "SpawnEntityGroupFromTable",
  "SpawnEntityListFromTableAsynchronous",
  "SpawnEntityListFromTableSynchronous",
  "SplineQuaternions",
  "SplineVectors",
  "StartSoundEvent",
  "StartSoundEventFromPosition",
  "StartSoundEventFromPositionReliable",
  "StartSoundEventFromPositionUnreliable",
  "StartSoundEventReliable",
  "StartSoundEventUnreliable",
  "StopEffect",
  "StopListeningToAllGameEvents",
  "StopListeningToGameEvent",
  "StopSoundEvent",
  "StopSoundOn",
  "StringToFile",
  "Time",
  "TraceCollideable",
  "TraceHull",
  "TraceLine",
  "UnitFilter",
  "UnloadSpawnGroup",
  "UnloadSpawnGroupByHandle",
  "UpdateEventPoints",
  "UTIL_MessageText",
  "UTIL_MessageText_WithContext",
  "UTIL_MessageTextAll",
  "UTIL_MessageTextAll_WithContext",
  "UTIL_Remove",
  "UTIL_RemoveImmediate",
  "UTIL_ResetMessageText",
  "UTIL_ResetMessageTextAll",
  "VectorToAngles",
  "Warning",
  ---- classes
  "Convars",
  "CustomGameEventManager",
  "CustomNetTables",
  "CustomUI",
  "Entities",
  "EntityFramework",
  "HeroList",
  "ParticleManager",
  "PlayerResource",
  "Tutorial",
  "Vector",
  ---- constants
  -- AbilityLearnResult_t
  "ABILITY_CAN_BE_UPGRADED", -- (0)
  "ABILITY_CANNOT_BE_UPGRADED_NOT_UPGRADABLE", -- (1)
  "ABILITY_CANNOT_BE_UPGRADED_AT_MAX", -- (2)
  "ABILITY_CANNOT_BE_UPGRADED_REQUIRES_LEVEL", -- (3)
  "ABILITY_NOT_LEARNABLE", -- (4)
  -- ABILITY_TYPES
  "ABILITY_TYPE_ATTRIBUTES",
  "ABILITY_TYPE_BASIC",
  "ABILITY_TYPE_HIDDEN",
  "ABILITY_TYPE_ULTIMATE",
  -- Convars Flags
  "FCVAR_CHEAT",
  -- DamageCategory_t
  "DOTA_DAMAGE_CATEGORY_ATTACK", -- (1)
  "DOTA_DAMAGE_CATEGORY_SPELL", -- (0)
  -- DOTA_GameState
  "DOTA_GAMERULES_STATE_INIT", -- (0)
  "DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD", -- (1)
  "DOTA_GAMERULES_STATE_CUSTOM_GAME_SETUP", -- (2)
  "DOTA_GAMERULES_STATE_HERO_SELECTION", -- (3)
  "DOTA_GAMERULES_STATE_STRATEGY_TIME", -- (4)
  "DOTA_GAMERULES_STATE_TEAM_SHOWCASE", -- (5)
  "DOTA_GAMERULES_STATE_WAIT_FOR_MAP_TO_LOAD", -- (6)
  "DOTA_GAMERULES_STATE_PRE_GAME", -- (7)
  "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS", -- (8)
  "DOTA_GAMERULES_STATE_POST_GAME", -- (9)
  "DOTA_GAMERULES_STATE_DISCONNECT", -- (10)
  -- DOTALimits_t
  "DOTA_DEFAULT_MAX_TEAM", -- (5) Default number of players per team.
  "DOTA_DEFAULT_MAX_TEAM_PLAYERS", -- (10) Default number of non-spectator players supported.
  "DOTA_MAX_PLAYER_TEAMS", -- (10) Max number of player teams supported.
  "DOTA_MAX_TEAM", -- (24) Max number of players per team.
  "DOTA_MAX_TEAM_PLAYERS", -- (24) Max number of non-spectator players supported.
  "DOTA_MAX_SPECTATOR_TEAM_SIZE", -- (40) How many spectators can watch.
  "DOTA_MAX_PLAYERS", -- (64) Max number of players connected to the server including spectators.
  -- DOTAMusicStatus_t
  "DOTA_MUSIC_STATUS_NONE", -- (0)
  "DOTA_MUSIC_STATUS_EXPLORATION", -- (1)
  "DOTA_MUSIC_STATUS_BATTLE", -- (2)
  "DOTA_MUSIC_STATUS_PRE_GAME_EXPLORATION", -- (3)
  "DOTA_MUSIC_STATUS_DEAD", -- (4)
  "DOTA_MUSIC_STATUS_LAST", -- (5)
  -- DOTA_RUNES
  "DOTA_RUNE_INVALID", -- (-1)
  "DOTA_RUNE_DOUBLEDAMAGE", -- (0)
  "DOTA_RUNE_HASTE", -- (1)
  "DOTA_RUNE_ILLUSION", -- (2)
  "DOTA_RUNE_INVISIBILITY", -- (3)
  "DOTA_RUNE_REGENERATION", -- (4)
  "DOTA_RUNE_BOUNTY", -- (5)
  "DOTA_RUNE_ARCANE", -- (6)
  "DOTA_RUNE_COUNT", -- (7)
  -- DOTAScriptInventorySlot_t
  "DOTA_ITEM_SLOT_1", -- (0)
  "DOTA_ITEM_SLOT_2", -- (1)
  "DOTA_ITEM_SLOT_3", -- (2)
  "DOTA_ITEM_SLOT_4", -- (3)
  "DOTA_ITEM_SLOT_5", -- (4)
  "DOTA_ITEM_SLOT_6", -- (5)
  "DOTA_ITEM_SLOT_7", -- (6)
  "DOTA_ITEM_SLOT_8", -- (7)
  "DOTA_ITEM_SLOT_9", -- (8)
  "DOTA_STASH_SLOT_1", -- (9)
  "DOTA_STASH_SLOT_2", -- (10)
  "DOTA_STASH_SLOT_3", -- (11)
  "DOTA_STASH_SLOT_4", -- (12)
  "DOTA_STASH_SLOT_5", -- (13)
  "DOTA_STASH_SLOT_6", -- (14)
  -- DOTATeam_t
  "DOTA_TEAM_GOODGUYS", -- (2)
  "DOTA_TEAM_BADGUYS", -- (3)
  "DOTA_TEAM_NEUTRALS", -- (4)
  "DOTA_TEAM_NOTEAM", -- (5)
  "DOTA_TEAM_CUSTOM_1", -- (6)
  "DOTA_TEAM_CUSTOM_2", -- (7)
  "DOTA_TEAM_CUSTOM_3", -- (8)
  "DOTA_TEAM_CUSTOM_4", -- (9)
  "DOTA_TEAM_CUSTOM_5", -- (10)
  "DOTA_TEAM_CUSTOM_6", -- (11)
  "DOTA_TEAM_CUSTOM_7", -- (12)
  "DOTA_TEAM_CUSTOM_8", -- (13)
  "DOTA_TEAM_FIRST", -- (2)
  "DOTA_TEAM_COUNT", -- (14)
  "DOTA_TEAM_CUSTOM_COUNT", -- (8)
  "DOTA_TEAM_CUSTOM_MIN", -- (6)
  "DOTA_TEAM_CUSTOM_MAX", -- (13)
  -- DOTAUnitAttackCapability_t
  "DOTA_UNIT_CAP_NO_ATTACK", -- (0) Unit is unable to attack in any way.
  "DOTA_UNIT_CAP_MELEE_ATTACK", -- (1) Unit attacks are classified as melee (no uphill miss chance, attacks on enemies that are 350 over the attack range automatically miss).
  "DOTA_UNIT_CAP_RANGED_ATTACK", -- (2) Unit attacks are classified as ranged (can miss on uphill, disjointable, has projectile).
  -- DOTAUnitMoveCapability_t
  "DOTA_UNIT_CAP_MOVE_NONE", -- (0) Unit cannot move in any way.
  "DOTA_UNIT_CAP_MOVE_GROUND", -- (1) Unit move while being obstructed by the terrain.
  "DOTA_UNIT_CAP_MOVE_FLY", -- (2) Unit ignores terrain.
  -- EDOTA_ModifyGold_Reason
  "DOTA_ModifyGold_Unspecified", -- (0)
  "DOTA_ModifyGold_Death", -- (1)
  "DOTA_ModifyGold_Buyback", -- (2)
  "DOTA_ModifyGold_PurchaseConsumable", -- (3)
  "DOTA_ModifyGold_PurchaseItem", -- (4)
  "DOTA_ModifyGold_AbandonedRedistribute", -- (5)
  "DOTA_ModifyGold_SellItem", -- (6)
  "DOTA_ModifyGold_AbilityCost", -- (7)
  "DOTA_ModifyGold_CheatCommand", -- (8)
  "DOTA_ModifyGold_SelectionPenalty", -- (9)
  "DOTA_ModifyGold_GameTick", -- (10)
  "DOTA_ModifyGold_Building", -- (11)
  "DOTA_ModifyGold_HeroKill", -- (12)
  "DOTA_ModifyGold_CreepKill", -- (13)
  "DOTA_ModifyGold_RoshanKill", -- (14)
  "DOTA_ModifyGold_CourierKill", -- (15)
  "DOTA_ModifyGold_SharedGold", -- (16)
  -- EDOTA_ModifyXP_Reason
  "DOTA_ModifyXP_Unspecified", -- (0)
  "DOTA_ModifyXP_HeroKill", -- (1)
  "DOTA_ModifyXP_CreepKill", -- (2)
  "DOTA_ModifyXP_RoshanKill", -- (3)
  -- Effects
  "EF_NODRAW",
  -- GameActivity_t
  "ACT_DOTA_IDLE", -- (1500)
  "ACT_DOTA_IDLE_RARE", -- (1501)
  "ACT_DOTA_RUN", -- (1502)
  "ACT_DOTA_ATTACK", -- (1503)
  "ACT_DOTA_ATTACK2", -- (1504)
  "ACT_DOTA_ATTACK_EVENT", -- (1505)
  "ACT_DOTA_DIE", -- (1506)
  "ACT_DOTA_FLINCH", -- (1507)
  "ACT_DOTA_FLAIL", -- (1508)
  "ACT_DOTA_DISABLED", -- (1509)
  "ACT_DOTA_CAST_ABILITY_1", -- (1510)
  "ACT_DOTA_CAST_ABILITY_2", -- (1511)
  "ACT_DOTA_CAST_ABILITY_3", -- (1512)
  "ACT_DOTA_CAST_ABILITY_4", -- (1513)
  "ACT_DOTA_CAST_ABILITY_5", -- (1514)
  "ACT_DOTA_CAST_ABILITY_6", -- (1515)
  "ACT_DOTA_OVERRIDE_ABILITY_1", -- (1516)
  "ACT_DOTA_OVERRIDE_ABILITY_2", -- (1517)
  "ACT_DOTA_OVERRIDE_ABILITY_3", -- (1518)
  "ACT_DOTA_OVERRIDE_ABILITY_4", -- (1519)
  "ACT_DOTA_CHANNEL_ABILITY_1", -- (1520)
  "ACT_DOTA_CHANNEL_ABILITY_2", -- (1521)
  "ACT_DOTA_CHANNEL_ABILITY_3", -- (1522)
  "ACT_DOTA_CHANNEL_ABILITY_4", -- (1523)
  "ACT_DOTA_CHANNEL_ABILITY_5", -- (1524)
  "ACT_DOTA_CHANNEL_ABILITY_6", -- (1525)
  "ACT_DOTA_CHANNEL_END_ABILITY_1", -- (1526)
  "ACT_DOTA_CHANNEL_END_ABILITY_2", -- (1527)
  "ACT_DOTA_CHANNEL_END_ABILITY_3", -- (1528)
  "ACT_DOTA_CHANNEL_END_ABILITY_4", -- (1529)
  "ACT_DOTA_CHANNEL_END_ABILITY_5", -- (1530)
  "ACT_DOTA_CHANNEL_END_ABILITY_6", -- (1531)
  "ACT_DOTA_CONSTANT_LAYER", -- (1532)
  "ACT_DOTA_CAPTURE", -- (1533)
  "ACT_DOTA_SPAWN", -- (1534)
  "ACT_DOTA_KILLTAUNT", -- (1535)
  "ACT_DOTA_TAUNT", -- (1536)
  "ACT_DOTA_THIRST", -- (1537)
  "ACT_DOTA_CAST_DRAGONBREATH", -- (1538)
  "ACT_DOTA_ECHO_SLAM", -- (1539)
  "ACT_DOTA_CAST_ABILITY_1_END", -- (1540)
  "ACT_DOTA_CAST_ABILITY_2_END", -- (1541)
  "ACT_DOTA_CAST_ABILITY_3_END", -- (1542)
  "ACT_DOTA_CAST_ABILITY_4_END", -- (1543)
  "ACT_MIRANA_LEAP_END", -- (1544)
  "ACT_WAVEFORM_START", -- (1545)
  "ACT_WAVEFORM_END", -- (1546)
  "ACT_DOTA_CAST_ABILITY_ROT", -- (1547)
  "ACT_DOTA_DIE_SPECIAL", -- (1548)
  "ACT_DOTA_RATTLETRAP_BATTERYASSAULT", -- (1549)
  "ACT_DOTA_RATTLETRAP_POWERCOGS", -- (1550)
  "ACT_DOTA_RATTLETRAP_HOOKSHOT_START", -- (1551)
  "ACT_DOTA_RATTLETRAP_HOOKSHOT_LOOP", -- (1552)
  "ACT_DOTA_RATTLETRAP_HOOKSHOT_END", -- (1553)
  "ACT_STORM_SPIRIT_OVERLOAD_RUN_OVERRIDE", -- (1554)
  "ACT_DOTA_TINKER_REARM1", -- (1555)
  "ACT_DOTA_TINKER_REARM2", -- (1556)
  "ACT_DOTA_TINKER_REARM3", -- (1557)
  "ACT_TINY_AVALANCHE", -- (1558)
  "ACT_TINY_TOSS", -- (1559)
  "ACT_TINY_GROWL", -- (1560)
  "ACT_DOTA_WEAVERBUG_ATTACH", -- (1561)
  "ACT_DOTA_CAST_WILD_AXES_END", -- (1562)
  "ACT_DOTA_CAST_LIFE_BREAK_START", -- (1563)
  "ACT_DOTA_CAST_LIFE_BREAK_END", -- (1564)
  "ACT_DOTA_NIGHTSTALKER_TRANSITION", -- (1565)
  "ACT_DOTA_LIFESTEALER_RAGE", -- (1566)
  "ACT_DOTA_LIFESTEALER_OPEN_WOUNDS", -- (1567)
  "ACT_DOTA_SAND_KING_BURROW_IN", -- (1568)
  "ACT_DOTA_SAND_KING_BURROW_OUT", -- (1569)
  "ACT_DOTA_EARTHSHAKER_TOTEM_ATTACK", -- (1570)
  "ACT_DOTA_WHEEL_LAYER", -- (1571)
  "ACT_DOTA_ALCHEMIST_CHEMICAL_RAGE_START", -- (1572)
  "ACT_DOTA_ALCHEMIST_CONCOCTION", -- (1573)
  "ACT_DOTA_JAKIRO_LIQUIDFIRE_START", -- (1574)
  "ACT_DOTA_JAKIRO_LIQUIDFIRE_LOOP", -- (1575)
  "ACT_DOTA_LIFESTEALER_INFEST", -- (1576)
  "ACT_DOTA_LIFESTEALER_INFEST_END", -- (1577)
  "ACT_DOTA_LASSO_LOOP", -- (1578)
  "ACT_DOTA_ALCHEMIST_CONCOCTION_THROW", -- (1579)
  "ACT_DOTA_ALCHEMIST_CHEMICAL_RAGE_END", -- (1580)
  "ACT_DOTA_CAST_COLD_SNAP", -- (1581)
  "ACT_DOTA_CAST_GHOST_WALK", -- (1582)
  "ACT_DOTA_CAST_TORNADO", -- (1583)
  "ACT_DOTA_CAST_EMP", -- (1584)
  "ACT_DOTA_CAST_ALACRITY", -- (1585)
  "ACT_DOTA_CAST_CHAOS_METEOR", -- (1586)
  "ACT_DOTA_CAST_SUN_STRIKE", -- (1587)
  "ACT_DOTA_CAST_FORGE_SPIRIT", -- (1588)
  "ACT_DOTA_CAST_ICE_WALL", -- (1589)
  "ACT_DOTA_CAST_DEAFENING_BLAST", -- (1590)
  "ACT_DOTA_VICTORY", -- (1591)
  "ACT_DOTA_DEFEAT", -- (1592)
  "ACT_DOTA_SPIRIT_BREAKER_CHARGE_POSE", -- (1593)
  "ACT_DOTA_SPIRIT_BREAKER_CHARGE_END", -- (1594)
  "ACT_DOTA_TELEPORT", -- (1595)
  "ACT_DOTA_TELEPORT_END", -- (1596)
  "ACT_DOTA_CAST_REFRACTION", -- (1597)
  "ACT_DOTA_CAST_ABILITY_7", -- (1598)
  "ACT_DOTA_CANCEL_SIREN_SONG", -- (1599)
  "ACT_DOTA_CHANNEL_ABILITY_7", -- (1600)
  "ACT_DOTA_LOADOUT", -- (1601)
  "ACT_DOTA_FORCESTAFF_END", -- (1602)
  "ACT_DOTA_POOF_END", -- (1603)
  "ACT_DOTA_SLARK_POUNCE", -- (1604)
  "ACT_DOTA_MAGNUS_SKEWER_START", -- (1605)
  "ACT_DOTA_MAGNUS_SKEWER_END", -- (1606)
  "ACT_DOTA_MEDUSA_STONE_GAZE", -- (1607)
  "ACT_DOTA_RELAX_START", -- (1608)
  "ACT_DOTA_RELAX_LOOP", -- (1609)
  "ACT_DOTA_RELAX_END", -- (1610)
  "ACT_DOTA_CENTAUR_STAMPEDE", -- (1611)
  "ACT_DOTA_BELLYACHE_START", -- (1612)
  "ACT_DOTA_BELLYACHE_LOOP", -- (1613)
  "ACT_DOTA_BELLYACHE_END", -- (1614)
  "ACT_DOTA_ROQUELAIRE_LAND", -- (1615)
  "ACT_DOTA_ROQUELAIRE_LAND_IDLE", -- (1616)
  "ACT_DOTA_GREEVIL_CAST", -- (1617)
  "ACT_DOTA_GREEVIL_OVERRIDE_ABILITY", -- (1618)
  "ACT_DOTA_GREEVIL_HOOK_START", -- (1619)
  "ACT_DOTA_GREEVIL_HOOK_END", -- (1620)
  "ACT_DOTA_GREEVIL_BLINK_BONE", -- (1621)
  "ACT_DOTA_IDLE_SLEEPING", -- (1622)
  "ACT_DOTA_INTRO", -- (1623)
  "ACT_DOTA_GESTURE_POINT", -- (1624)
  "ACT_DOTA_GESTURE_ACCENT", -- (1625)
  "ACT_DOTA_SLEEPING_END", -- (1626)
  "ACT_DOTA_AMBUSH", -- (1627)
  "ACT_DOTA_ITEM_LOOK", -- (1628)
  "ACT_DOTA_STARTLE", -- (1629)
  "ACT_DOTA_FRUSTRATION", -- (1630)
  "ACT_DOTA_TELEPORT_REACT", -- (1631)
  "ACT_DOTA_TELEPORT_END_REACT", -- (1632)
  "ACT_DOTA_SHRUG", -- (1633)
  "ACT_DOTA_RELAX_LOOP_END", -- (1634)
  "ACT_DOTA_PRESENT_ITEM", -- (1635)
  "ACT_DOTA_IDLE_IMPATIENT", -- (1636)
  "ACT_DOTA_SHARPEN_WEAPON", -- (1637)
  "ACT_DOTA_SHARPEN_WEAPON_OUT", -- (1638)
  "ACT_DOTA_IDLE_SLEEPING_END", -- (1639)
  "ACT_DOTA_BRIDGE_DESTROY", -- (1640)
  "ACT_DOTA_TAUNT_SNIPER", -- (1641)
  "ACT_DOTA_DEATH_BY_SNIPER", -- (1642)
  "ACT_DOTA_LOOK_AROUND", -- (1643)
  "ACT_DOTA_CAGED_CREEP_RAGE", -- (1644)
  "ACT_DOTA_CAGED_CREEP_RAGE_OUT", -- (1645)
  "ACT_DOTA_CAGED_CREEP_SMASH", -- (1646)
  "ACT_DOTA_CAGED_CREEP_SMASH_OUT", -- (1647)
  "ACT_DOTA_IDLE_IMPATIENT_SWORD_TAP", -- (1648)
  "ACT_DOTA_INTRO_LOOP", -- (1649)
  "ACT_DOTA_BRIDGE_THREAT", -- (1650)
  "ACT_DOTA_DAGON", -- (1651)
  "ACT_DOTA_CAST_ABILITY_2_ES_ROLL_START", -- (1652)
  "ACT_DOTA_CAST_ABILITY_2_ES_ROLL", -- (1653)
  "ACT_DOTA_CAST_ABILITY_2_ES_ROLL_END", -- (1654)
  "ACT_DOTA_NIAN_PIN_START", -- (1655)
  "ACT_DOTA_NIAN_PIN_LOOP", -- (1656)
  "ACT_DOTA_NIAN_PIN_END", -- (1657)
  "ACT_DOTA_LEAP_STUN", -- (1658)
  "ACT_DOTA_LEAP_SWIPE", -- (1659)
  "ACT_DOTA_NIAN_INTRO_LEAP", -- (1660)
  "ACT_DOTA_AREA_DENY", -- (1661)
  "ACT_DOTA_NIAN_PIN_TO_STUN", -- (1662)
  "ACT_DOTA_RAZE_1", -- (1663)
  "ACT_DOTA_RAZE_2", -- (1664)
  "ACT_DOTA_RAZE_3", -- (1665)
  "ACT_DOTA_UNDYING_DECAY", -- (1666)
  "ACT_DOTA_UNDYING_SOUL_RIP", -- (1667)
  "ACT_DOTA_UNDYING_TOMBSTONE", -- (1668)
  "ACT_DOTA_WHIRLING_AXES_RANGED", -- (1669)
  "ACT_DOTA_SHALLOW_GRAVE", -- (1670)
  "ACT_DOTA_COLD_FEET", -- (1671)
  "ACT_DOTA_ICE_VORTEX", -- (1672)
  "ACT_DOTA_CHILLING_TOUCH", -- (1673)
  "ACT_DOTA_ENFEEBLE", -- (1674)
  "ACT_DOTA_FATAL_BONDS", -- (1675)
  "ACT_DOTA_MIDNIGHT_PULSE", -- (1676)
  "ACT_DOTA_ANCESTRAL_SPIRIT", -- (1677)
  "ACT_DOTA_THUNDER_STRIKE", -- (1678)
  "ACT_DOTA_KINETIC_FIELD", -- (1679)
  "ACT_DOTA_STATIC_STORM", -- (1680)
  "ACT_DOTA_MINI_TAUNT", -- (1681)
  "ACT_DOTA_ARCTIC_BURN_END", -- (1682)
  "ACT_DOTA_LOADOUT_RARE", -- (1683)
  "ACT_DOTA_SWIM", -- (1684)
  "ACT_DOTA_FLEE", -- (1685)
  "ACT_DOTA_TROT", -- (1686)
  "ACT_DOTA_SHAKE", -- (1687)
  "ACT_DOTA_SWIM_IDLE", -- (1688)
  "ACT_DOTA_WAIT_IDLE", -- (1689)
  "ACT_DOTA_GREET", -- (1690)
  "ACT_DOTA_TELEPORT_COOP_START", -- (1691)
  "ACT_DOTA_TELEPORT_COOP_WAIT", -- (1692)
  "ACT_DOTA_TELEPORT_COOP_END", -- (1693)
  "ACT_DOTA_TELEPORT_COOP_EXIT", -- (1694)
  "ACT_DOTA_SHOPKEEPER_PET_INTERACT", -- (1695)
  "ACT_DOTA_ITEM_PICKUP", -- (1696)
  "ACT_DOTA_ITEM_DROP", -- (1697)
  "ACT_DOTA_CAPTURE_PET", -- (1698)
  "ACT_DOTA_PET_WARD_OBSERVER", -- (1699)
  "ACT_DOTA_PET_WARD_SENTRY", -- (1700)
  "ACT_DOTA_PET_LEVEL", -- (1701)
  "ACT_DOTA_CAST_BURROW_END", -- (1702)
  "ACT_DOTA_LIFESTEALER_ASSIMILATE", -- (1703)
  "ACT_DOTA_LIFESTEALER_EJECT", -- (1704)
  "ACT_DOTA_ATTACK_EVENT_BASH", -- (1705)
  "ACT_DOTA_CAPTURE_RARE", -- (1706)
  "ACT_DOTA_AW_MAGNETIC_FIELD", -- (1707)
  "ACT_DOTA_CAST_GHOST_SHIP" -- (1708)
}

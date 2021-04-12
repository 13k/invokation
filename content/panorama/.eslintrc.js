module.exports = {
  root: true,
  parser: require.resolve("@typescript-eslint/parser"),
  extends: [require.resolve("./.eslintrc.plugins.js")],
};

/*
env:
  2020: true
globals:
  $: readonly
  Abilities: readonly
  ABILITY_TYPES: readonly
  AbilityLearnResult_t: readonly
  Attributes: readonly
  Buffs: readonly
  CLICK_BEHAVIORS: readonly
  CustomNetTables: readonly
  DAMAGE_TYPES: readonly
  DOTA_ABILITY_BEHAVIOR: readonly
  DOTA_GameState: readonly
  DOTA_GC_TEAM: readonly
  DOTA_HeroPickState: readonly
  DOTA_MOTION_CONTROLLER_PRIORITY: readonly
  DOTA_OVERHEAD_ALERT: readonly
  DOTA_RUNES: readonly
  DOTA_SHOP_TYPE: readonly
  DOTA_UNIT_TARGET_FLAGS: readonly
  DOTA_UNIT_TARGET_TEAM: readonly
  DOTA_UNIT_TARGET_TYPE: readonly
  DOTAAbilitySpeakTrigger_t: readonly
  DOTAConnectionState_t: readonly
  DotaCustomUIType_t: readonly
  DOTADamageFlag_t: readonly
  DotaDefaultUIElement_t: readonly
  DOTAInventoryFlags_t: readonly
  DOTAKeybindCommand_t: readonly
  DOTALimits_t: readonly
  DOTAMinimapEvent_t: readonly
  DOTAModifierAttribute_t: readonly
  DOTAMusicStatus_t: readonly
  DOTASlotType_t: readonly
  DOTASpeechType_t: readonly
  DOTATeam_t: readonly
  DOTAUnitAttackCapability_t: readonly
  DOTAUnitMoveCapability_t: readonly
  dotaunitorder_t: readonly
  EDOTA_ModifyGold_Reason: readonly
  EDOTA_ModifyXP_Reason: readonly
  Entities: readonly
  EShareAbility: readonly
  EventData: readonly
  Game: readonly
  GameActivity_t: readonly
  GameEvents: readonly
  GameUI: readonly
  Items: readonly
  LocalInventory: readonly
  modifierfunction: readonly
  modifierstate: readonly
  OrderQueueBehavior_t: readonly
  ParticleAttachment_t: readonly
  Particles: readonly
  PlayerOrderIssuer_t: readonly
  Players: readonly
  PlayerUltimateStateOrTime_t: readonly
  SPELL_IMMUNITY_TYPES: readonly
  SteamFriends: readonly
  SteamUGC: readonly
  SteamUGCMatchingUGCType: readonly
  SteamUGCQuery: readonly
  SteamUniverse: readonly
  SteamUtils: readonly
  VRUtils: readonly
*/

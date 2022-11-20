"use strict";

(function (global /*, context */) {
  var META = {
    VERSION: "v0.4.7",
    URL: "https://github.com/13k/invokation",
    CHANGELOG_URL: "https://github.com/13k/invokation/blob/master/CHANGELOG.md",
  };

  var NET_TABLE = {
    MAIN: {
      NAME: "invokation",
      KEYS: {
        COMBOS: "combos",
        SHOP_ITEMS: "shop_items",
        HERO_DATA: "hero_data",
      },
    },
    HERO: {
      NAME: "hero",
      KEYS: {
        KEY_VALUES: "kv",
      },
    },
    ABILITIES: {
      NAME: "abilities",
      KEYS: {
        KEY_VALUES: "kv",
      },
    },
  };

  var EVENTS = {
    // combo viewer
    VIEWER_RENDER: "invokation_viewer_render",
    // combos
    COMBOS_RELOAD: "invokation_combos_reload",
    COMBO_START: "invokation_combo_start",
    COMBO_STARTED: "invokation_combo_started",
    COMBO_STOP: "invokation_combo_stop",
    COMBO_STOPPED: "invokation_combo_stopped",
    COMBO_IN_PROGRESS: "invokation_combo_in_progress",
    COMBO_PROGRESS: "invokation_combo_progress",
    COMBO_STEP_ERROR: "invokation_combo_step_error",
    COMBO_PRE_FINISH: "invokation_combo_pre_finish",
    COMBO_FINISHED: "invokation_combo_finished",
    COMBO_RESTART: "invokation_combo_restart",
    // freestyle
    FREESTYLE_HERO_LEVEL_UP: "invokation_freestyle_hero_level_up",
    // combat log
    COMBAT_LOG_ABILITY_USED: "invokation_combat_log_ability_used",
    COMBAT_LOG_CLEAR: "invokation_combat_log_clear",
    COMBAT_LOG_CAPTURE_START: "invokation_combat_log_capture_start",
    COMBAT_LOG_CAPTURE_STOP: "invokation_combat_log_capture_stop",
    // item picker
    ITEM_PICKER_QUERY: "invokation_item_picker_query",
    ITEM_PICKER_QUERY_RESPONSE: "invokation_item_picker_query_response",
    // popups
    POPUP_TEXT_ENTRY_SUBMIT: "invokation_popup_text_entry_submit",
    POPUP_ITEM_PICKER_SUBMIT: "invokation_popup_item_picker_submit",
    POPUP_ABILITY_PICKER_SUBMIT: "invokation_popup_ability_picker_submit",
  };

  var UI_EVENTS = {
    EXTERNAL_BROWSER_GO_TO_URL: "ExternalBrowserGoToURL",
    PLAY_SOUND: "PlaySoundEffect",
    SHOW_TOOLTIP: "UIShowCustomLayoutTooltip",
    SHOW_TOOLTIP_PARAMS: "UIShowCustomLayoutParametersTooltip",
    HIDE_TOOLTIP: "UIHideCustomLayoutTooltip",
    SHOW_TEXT_TOOLTIP: "DOTAShowTextTooltip",
    HIDE_TEXT_TOOLTIP: "DOTAHideTextTooltip",
    SHOW_ABILITY_TOOLTIP: "DOTAShowAbilityTooltip",
    SHOW_ABILITY_TOOLTIP_ENTITY_INDEX: "DOTAShowAbilityTooltipForEntityIndex",
    SHOW_ABILITY_TOOLTIP_GUIDE: "DOTAShowAbilityTooltipForGuide",
    SHOW_ABILITY_TOOLTIP_HERO: "DOTAShowAbilityTooltipForHero",
    SHOW_ABILITY_TOOLTIP_LEVEL: "DOTAShowAbilityTooltipForLevel",
    HIDE_ABILITY_TOOLTIP: "DOTAHideAbilityTooltip",
    SHOW_POPUP: "UIShowCustomLayoutPopup",
    SHOW_POPUP_PARAMS: "UIShowCustomLayoutPopupParameters",
    POPUP_BUTTON_CLICKED: "UIPopupButtonClicked",
  };

  var TALENTS = {
    L10_RIGHT: 0x01,
    L10_LEFT: 0x02,
    L15_RIGHT: 0x04,
    L15_LEFT: 0x08,
    L20_RIGHT: 0x10,
    L20_LEFT: 0x20,
    L25_RIGHT: 0x40,
    L25_LEFT: 0x80,
  };

  var INVOKER = {};

  INVOKER.ABILITY_QUAS = "invoker_quas";
  INVOKER.ABILITY_WEX = "invoker_wex";
  INVOKER.ABILITY_EXORT = "invoker_exort";
  INVOKER.ABILITY_INVOKE = "invoker_invoke";

  INVOKER.ABILITY_COLD_SNAP = "invoker_cold_snap";
  INVOKER.ABILITY_GHOST_WALK = "invoker_ghost_walk";
  INVOKER.ABILITY_ICE_WALL = "invoker_ice_wall";
  INVOKER.ABILITY_EMP = "invoker_emp";
  INVOKER.ABILITY_TORNADO = "invoker_tornado";
  INVOKER.ABILITY_ALACRITY = "invoker_alacrity";
  INVOKER.ABILITY_SUN_STRIKE = "invoker_sun_strike";
  INVOKER.ABILITY_FORGE_SPIRIT = "invoker_forge_spirit";
  INVOKER.ABILITY_CHAOS_METEOR = "invoker_chaos_meteor";
  INVOKER.ABILITY_DEAFENING_BLAST = "invoker_deafening_blast";

  // FIXME: Talent ability names shouldn't be hardcoded.
  // VScript dynamically parses the hero KeyValues for these names.

  INVOKER.ABILITY_TALENT_L10_RIGHT = "special_bonus_unique_invoker_10";
  INVOKER.ABILITY_TALENT_L10_LEFT = "special_bonus_unique_invoker_3";
  INVOKER.ABILITY_TALENT_L15_RIGHT = "special_bonus_unique_invoker_11";
  INVOKER.ABILITY_TALENT_L15_LEFT = "special_bonus_unique_invoker_9";
  INVOKER.ABILITY_TALENT_L20_RIGHT = "special_bonus_unique_invoker_6";
  INVOKER.ABILITY_TALENT_L20_LEFT = "special_bonus_unique_invoker_5";
  INVOKER.ABILITY_TALENT_L25_RIGHT = "special_bonus_unique_invoker_2";
  INVOKER.ABILITY_TALENT_L25_LEFT = "special_bonus_unique_invoker_13";

  INVOKER.ORB_ABILITIES = {};
  INVOKER.ORB_ABILITIES[INVOKER.ABILITY_QUAS] = INVOKER.ABILITY_QUAS;
  INVOKER.ORB_ABILITIES[INVOKER.ABILITY_WEX] = INVOKER.ABILITY_WEX;
  INVOKER.ORB_ABILITIES[INVOKER.ABILITY_EXORT] = INVOKER.ABILITY_EXORT;

  INVOKER.SPELL_ABILITIES = {};
  INVOKER.SPELL_ABILITIES[INVOKER.ABILITY_COLD_SNAP] = INVOKER.ABILITY_COLD_SNAP;
  INVOKER.SPELL_ABILITIES[INVOKER.ABILITY_GHOST_WALK] = INVOKER.ABILITY_GHOST_WALK;
  INVOKER.SPELL_ABILITIES[INVOKER.ABILITY_ICE_WALL] = INVOKER.ABILITY_ICE_WALL;
  INVOKER.SPELL_ABILITIES[INVOKER.ABILITY_EMP] = INVOKER.ABILITY_EMP;
  INVOKER.SPELL_ABILITIES[INVOKER.ABILITY_TORNADO] = INVOKER.ABILITY_TORNADO;
  INVOKER.SPELL_ABILITIES[INVOKER.ABILITY_ALACRITY] = INVOKER.ABILITY_ALACRITY;
  INVOKER.SPELL_ABILITIES[INVOKER.ABILITY_SUN_STRIKE] = INVOKER.ABILITY_SUN_STRIKE;
  INVOKER.SPELL_ABILITIES[INVOKER.ABILITY_FORGE_SPIRIT] = INVOKER.ABILITY_FORGE_SPIRIT;
  INVOKER.SPELL_ABILITIES[INVOKER.ABILITY_CHAOS_METEOR] = INVOKER.ABILITY_CHAOS_METEOR;
  INVOKER.SPELL_ABILITIES[INVOKER.ABILITY_DEAFENING_BLAST] = INVOKER.ABILITY_DEAFENING_BLAST;

  INVOKER.TALENT_ABILITIES = [
    INVOKER.ABILITY_TALENT_L10_RIGHT,
    INVOKER.ABILITY_TALENT_L10_LEFT,
    INVOKER.ABILITY_TALENT_L15_RIGHT,
    INVOKER.ABILITY_TALENT_L15_LEFT,
    INVOKER.ABILITY_TALENT_L20_RIGHT,
    INVOKER.ABILITY_TALENT_L20_LEFT,
    INVOKER.ABILITY_TALENT_L25_RIGHT,
    INVOKER.ABILITY_TALENT_L25_LEFT,
  ];

  var COMBO_PROPERTIES = {
    specialty: ["qw", "qe"],
    stance: ["offensive", "defensive"],
    damageRating: [0, 1, 2, 3, 4, 5],
    difficultyRating: [1, 2, 3, 4, 5],
  };

  var SHOP_CATEGORIES = {
    basics: ["consumables", "attributes", "weapons_armor", "misc", "secretshop"],
    upgrades: ["basics", "support", "magics", "defense", "weapons", "artifacts"],
  };

  global.Const = {};
  global.Const.META = META;
  global.Const.NET_TABLE = NET_TABLE;
  global.Const.EVENTS = EVENTS;
  global.Const.UI_EVENTS = UI_EVENTS;
  global.Const.TALENTS = TALENTS;
  global.Const.INVOKER = INVOKER;
  global.Const.FREESTYLE_COMBO_ID = "freestyle";
  global.Const.COMBO_PROPERTIES = COMBO_PROPERTIES;
  global.Const.SHOP_CATEGORIES = SHOP_CATEGORIES;
})(GameUI.CustomUIConfig(), this);

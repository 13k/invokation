"use strict";

((global /*, context */) => {
  const META = {
    VERSION: "v0.4.6-beta1",
    URL: "https://github.com/13k/invokation",
    CHANGELOG_URL: "https://github.com/13k/invokation/blob/master/CHANGELOG.md",
  };

  const NET_TABLE = {
    MAIN: "invokation",
    KEYS: {
      MAIN: {
        COMBOS: "combos",
        ABILITIES_KEY_VALUES: "abilities_kv",
        SHOP_ITEMS: "shop_items",
      },
    },
  };

  const DOTA_UI = {
    // [0] Time of day (clock)
    DOTA_DEFAULT_UI_TOP_TIMEOFDAY: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_TOP_TIMEOFDAY"],
    // [1] Heroes and team score at the top of the HUD
    DOTA_DEFAULT_UI_TOP_HEROES: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_TOP_HEROES"],
    // [2] Flyout scoreboard
    DOTA_DEFAULT_UI_FLYOUT_SCOREBOARD: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_FLYOUT_SCOREBOARD"],
    // [3] Hero actions UI
    DOTA_DEFAULT_UI_ACTION_PANEL: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_ACTION_PANEL"],
    // [4] Minimap
    DOTA_DEFAULT_UI_ACTION_MINIMAP: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_ACTION_MINIMAP"],
    // [5] Entire inventory UI
    DOTA_DEFAULT_UI_INVENTORY_PANEL: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_INVENTORY_PANEL"],
    // [6] Shop portion of the inventory
    DOTA_DEFAULT_UI_INVENTORY_SHOP: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_INVENTORY_SHOP"],
    // [7] Inventory items
    DOTA_DEFAULT_UI_INVENTORY_ITEMS: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_INVENTORY_ITEMS"],
    // [8] Quickbuy (disabling this will cause gold count to bug)
    DOTA_DEFAULT_UI_INVENTORY_QUICKBUY:
      DotaDefaultUIElement_t["DOTA_DEFAULT_UI_INVENTORY_QUICKBUY"],
    // [9] Courier controls
    DOTA_DEFAULT_UI_INVENTORY_COURIER: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_INVENTORY_COURIER"],
    // [10] Glyph
    DOTA_DEFAULT_UI_INVENTORY_PROTECT: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_INVENTORY_PROTECT"],
    // [11] Gold display
    DOTA_DEFAULT_UI_INVENTORY_GOLD: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_INVENTORY_GOLD"],
    // [12] Suggested items shop panel
    DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS:
      DotaDefaultUIElement_t["DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS"],
    // [13] Hero selection Radiant and Dire player lists
    DOTA_DEFAULT_UI_HERO_SELECTION_TEAMS:
      DotaDefaultUIElement_t["DOTA_DEFAULT_UI_HERO_SELECTION_TEAMS"],
    // [14] Hero selection game mode name display
    DOTA_DEFAULT_UI_HERO_SELECTION_GAME_NAME:
      DotaDefaultUIElement_t["DOTA_DEFAULT_UI_HERO_SELECTION_GAME_NAME"],
    // [15] Hero selection clock
    DOTA_DEFAULT_UI_HERO_SELECTION_CLOCK:
      DotaDefaultUIElement_t["DOTA_DEFAULT_UI_HERO_SELECTION_CLOCK"],
    // [16] Top-left menu buttons in the HUD
    DOTA_DEFAULT_UI_TOP_MENU_BUTTONS: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_TOP_MENU_BUTTONS"],
    // [17] Top-left menu buttons in the HUD
    DOTA_DEFAULT_UI_TOP_BAR_BACKGROUND:
      DotaDefaultUIElement_t["DOTA_DEFAULT_UI_TOP_BAR_BACKGROUND"],
    // [18] Top-bar Radiant players
    DOTA_DEFAULT_UI_TOP_BAR_RADIANT_TEAM:
      DotaDefaultUIElement_t["DOTA_DEFAULT_UI_TOP_BAR_RADIANT_TEAM"],
    // [19] Top-bar Dire players
    DOTA_DEFAULT_UI_TOP_BAR_DIRE_TEAM: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_TOP_BAR_DIRE_TEAM"],
    // [20] Top-bar score
    DOTA_DEFAULT_UI_TOP_BAR_SCORE: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_TOP_BAR_SCORE"],
    // [21] Endgame scoreboard
    DOTA_DEFAULT_UI_ENDGAME: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_ENDGAME"],
    // [22] Endgame chat
    DOTA_DEFAULT_UI_ENDGAME_CHAT: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_ENDGAME_CHAT"],
    // [23] Quick stats (KDA/CS) at top-left
    DOTA_DEFAULT_UI_QUICK_STATS: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_QUICK_STATS"],
    // [24] Pregame "strategy time" UI
    DOTA_DEFAULT_UI_PREGAME_STRATEGYUI:
      DotaDefaultUIElement_t["DOTA_DEFAULT_UI_PREGAME_STRATEGYUI"],
    // [25] Kill-cam
    DOTA_DEFAULT_UI_KILLCAM: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_KILLCAM"],
    // [26] Top-bar HUD (?)
    DOTA_DEFAULT_UI_TOP_BAR: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_TOP_BAR"],
    // [27] Render custom UI elements in front of HUD
    DOTA_DEFAULT_UI_CUSTOMUI_BEHIND_HUD_ELEMENTS:
      DotaDefaultUIElement_t["DOTA_DEFAULT_UI_CUSTOMUI_BEHIND_HUD_ELEMENTS"],
    // [28] ?
    DOTA_DEFAULT_UI_ELEMENT_COUNT: DotaDefaultUIElement_t["DOTA_DEFAULT_UI_ELEMENT_COUNT"],
  };

  const EVENTS = {
    // combo picker
    PICKER_TOGGLE: "invokation_picker_toggle",
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

  const UI_EVENTS = {
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

  const LAYOUTS = {
    COMBO_SCORE: "file://{resources}/layout/custom_game/combo_score.xml",
    PICKER: {
      COMBO_PANEL: "file://{resources}/layout/custom_game/picker_combo.xml",
    },
    CHALLENGE: {
      COMBO_STEP: "file://{resources}/layout/custom_game/challenge_combo_step.xml",
    },
    VIEWER: {
      COMBO_STEP: "file://{resources}/layout/custom_game/viewer_combo_step.xml",
      PROPERTIES: "file://{resources}/layout/custom_game/viewer_properties.xml",
    },
    POPUPS: {
      GAME_INFO: "file://{resources}/layout/custom_game/popups/popup_game_info.xml",
      ITEM_PICKER: "file://{resources}/layout/custom_game/popups/popup_item_picker.xml",
      INVOKER_ABILITY_PICKER:
        "file://{resources}/layout/custom_game/popups/popup_invoker_ability_picker.xml",
      TEXT_ENTRY: "file://{resources}/layout/custom_game/popups/popup_text_entry.xml",
    },
    TOOLTIPS: {
      STAT_BRANCH: "file://{resources}/layout/custom_game/tooltips/tooltip_stat_branch.xml",
    },
    UI: {
      ITEM_PICKER: "file://{resources}/layout/custom_game/ui/item_picker.xml",
      TALENTS_DISPLAY: "file://{resources}/layout/custom_game/ui/talents_display.xml",
      TAG_SELECT: "file://{resources}/layout/custom_game/ui/tag_select.xml",
    },
  };

  const CSS_CLASSES = {
    DEVELOPMENT: "development",
    HIDE: "Hide",
    SHOW: "Show",
  };

  const TALENTS = {
    L10_RIGHT: 0x01,
    L10_LEFT: 0x02,
    L15_RIGHT: 0x04,
    L15_LEFT: 0x08,
    L20_RIGHT: 0x10,
    L20_LEFT: 0x20,
    L25_RIGHT: 0x40,
    L25_LEFT: 0x80,
  };

  const TALENT_LEVELS = [10, 15, 20, 25];

  const INVOKER = {
    ABILITY_QUAS: "invoker_quas",
    ABILITY_WEX: "invoker_wex",
    ABILITY_EXORT: "invoker_exort",
    ABILITY_INVOKE: "invoker_invoke",
    ABILITY_COLD_SNAP: "invoker_cold_snap",
    ABILITY_GHOST_WALK: "invoker_ghost_walk",
    ABILITY_ICE_WALL: "invoker_ice_wall",
    ABILITY_EMP: "invoker_emp",
    ABILITY_TORNADO: "invoker_tornado",
    ABILITY_ALACRITY: "invoker_alacrity",
    ABILITY_SUN_STRIKE: "invoker_sun_strike",
    ABILITY_FORGE_SPIRIT: "invoker_forge_spirit",
    ABILITY_CHAOS_METEOR: "invoker_chaos_meteor",
    ABILITY_DEAFENING_BLAST: "invoker_deafening_blast",
    // FIXME: Talent ability names shouldn't be hardcoded.
    // vscript dynamically parses the hero KeyValues for these names.
    ABILITY_TALENT_L10_RIGHT: "special_bonus_unique_invoker_10",
    ABILITY_TALENT_L10_LEFT: "special_bonus_unique_invoker_6",
    ABILITY_TALENT_L15_RIGHT: "special_bonus_unique_invoker_13",
    ABILITY_TALENT_L15_LEFT: "special_bonus_unique_invoker_9",
    ABILITY_TALENT_L20_RIGHT: "special_bonus_unique_invoker_3",
    ABILITY_TALENT_L20_LEFT: "special_bonus_unique_invoker_5",
    ABILITY_TALENT_L25_RIGHT: "special_bonus_unique_invoker_2",
    ABILITY_TALENT_L25_LEFT: "special_bonus_unique_invoker_11",
  };

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

  const FREESTYLE_COMBO_ID = "freestyle";

  const COMBO_PROPERTIES = {
    specialty: ["qw", "qe"],
    stance: ["offensive", "defensive"],
    damageRating: [0, 1, 2, 3, 4, 5],
    difficultyRating: [1, 2, 3, 4, 5],
  };

  const SHOP_CATEGORIES = {
    basics: ["consumables", "attributes", "weapons_armor", "misc", "secretshop"],
    upgrades: ["basics", "support", "magics", "defense", "weapons", "artifacts"],
  };

  global.Const = {
    META,
    NET_TABLE,
    DOTA_UI,
    EVENTS,
    UI_EVENTS,
    LAYOUTS,
    CSS_CLASSES,
    TALENTS,
    TALENT_LEVELS,
    INVOKER,
    FREESTYLE_COMBO_ID,
    COMBO_PROPERTIES,
    SHOP_CATEGORIES,
  };
})(GameUI.CustomUIConfig(), this);

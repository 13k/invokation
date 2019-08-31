"use strict";

(function(global, context) {
  var _ = global.lodash;
  var CombosCollection = global.CombosCollection;
  var CreateComponent = context.CreateComponent;

  var UI_CONFIG = {
    // Hero selection Radiant and Dire player lists.
    DOTA_DEFAULT_UI_HERO_SELECTION_TEAMS: false,
    // Hero selection game mode name display.
    DOTA_DEFAULT_UI_HERO_SELECTION_GAME_NAME: false,
    // Hero selection clock.
    DOTA_DEFAULT_UI_HERO_SELECTION_CLOCK: false,
    // No pregame strategy UI.
    DOTA_DEFAULT_UI_PREGAME_STRATEGYUI: false,
    // Time of day (clock).
    DOTA_DEFAULT_UI_TOP_TIMEOFDAY: false,
    // Heroes and team score at the top of the HUD.
    DOTA_DEFAULT_UI_TOP_HEROES: false,
    // Lefthand flyout scoreboard.
    DOTA_DEFAULT_UI_FLYOUT_SCOREBOARD: false,
    // Hero actions UI.
    DOTA_DEFAULT_UI_ACTION_PANEL: true,
    // Minimap.
    DOTA_DEFAULT_UI_ACTION_MINIMAP: false,
    // Entire Inventory UI
    DOTA_DEFAULT_UI_INVENTORY_PANEL: true,
    // Shop portion of the Inventory.
    DOTA_DEFAULT_UI_INVENTORY_SHOP: false,
    // Player items.
    DOTA_DEFAULT_UI_INVENTORY_ITEMS: true,
    // Quickbuy.
    DOTA_DEFAULT_UI_INVENTORY_QUICKBUY: false,
    // Courier controls.
    DOTA_DEFAULT_UI_INVENTORY_COURIER: false,
    // Glyph.
    DOTA_DEFAULT_UI_INVENTORY_PROTECT: false,
    // Gold display.
    DOTA_DEFAULT_UI_INVENTORY_GOLD: false,
    // Suggested items shop panel.
    DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS: false,
    // Top-bar HUD.
    DOTA_DEFAULT_UI_TOP_BAR: false,
    // Top-left menu buttons in the HUD.
    DOTA_DEFAULT_UI_TOP_BAR_BACKGROUND: false,
    // Top-bar Radiant players.
    DOTA_DEFAULT_UI_TOP_BAR_RADIANT_TEAM: false,
    // Top-bar Dire players.
    DOTA_DEFAULT_UI_TOP_BAR_DIRE_TEAM: false,
    // Top-bar score.
    DOTA_DEFAULT_UI_TOP_BAR_SCORE: false,
    // Top-left menu buttons in the HUD.
    DOTA_DEFAULT_UI_TOP_MENU_BUTTONS: false,
    // Quick stats (KDA/CS) at top-left.
    DOTA_DEFAULT_UI_QUICK_STATS: false,
    // Endgame scoreboard.
    DOTA_DEFAULT_UI_ENDGAME: false,
    // Endgame chat.
    DOTA_DEFAULT_UI_ENDGAME_CHAT: false,
    // Kill-cam
    DOTA_DEFAULT_UI_KILLCAM: false,
    // ?
    DOTA_DEFAULT_UI_ELEMENT_COUNT: false,
  };

  var CustomUIManifest = CreateComponent({
    constructor: function CustomUIManifest() {
      CustomUIManifest.super.call(this);

      _.forEach(UI_CONFIG, function(value, key) {
        GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t[key], value);
      });

      global.COMBOS = new CombosCollection();
      global.COMBOS.Load();

      this.debug("init");
    },
  });

  context.customUIManifest = new CustomUIManifest();
})(GameUI.CustomUIConfig(), this);

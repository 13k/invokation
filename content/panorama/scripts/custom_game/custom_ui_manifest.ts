import { AbilitiesCollection } from "./lib/abilities_collection";
import { CombosCollection } from "./lib/combos_collection";
import { Component } from "./lib/component";
import { UI } from "./lib/ui";

export type Inputs = never;
export type Outputs = never;

type UIConfig = Partial<Record<keyof typeof DotaDefaultUIElement_t, boolean>>;

const UI_CONFIG: UIConfig = {
  // [0] Time of day (clock)
  DOTA_DEFAULT_UI_TOP_TIMEOFDAY: false,
  // [1] Heroes and team score at the top of the HUD
  DOTA_DEFAULT_UI_TOP_HEROES: false,
  // [2] Flyout scoreboard
  DOTA_DEFAULT_UI_FLYOUT_SCOREBOARD: false,
  // [3] Hero actions UI
  DOTA_DEFAULT_UI_ACTION_PANEL: true,
  // [4] Minimap
  DOTA_DEFAULT_UI_ACTION_MINIMAP: false,
  // [5] Entire inventory UI
  DOTA_DEFAULT_UI_INVENTORY_PANEL: true,
  // [6] Shop portion of the inventory
  DOTA_DEFAULT_UI_INVENTORY_SHOP: false,
  // [7] Inventory items
  DOTA_DEFAULT_UI_INVENTORY_ITEMS: true,
  // [8] Quickbuy (disabling this will cause gold count to bug)
  DOTA_DEFAULT_UI_INVENTORY_QUICKBUY: true,
  // [9] Courier controls
  DOTA_DEFAULT_UI_INVENTORY_COURIER: false,
  // [10] Glyph
  DOTA_DEFAULT_UI_INVENTORY_PROTECT: false,
  // [11] Gold display
  DOTA_DEFAULT_UI_INVENTORY_GOLD: true,
  // [12] Suggested items shop panel
  DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS: true,
  // [13] Hero selection Radiant and Dire player lists
  DOTA_DEFAULT_UI_HERO_SELECTION_TEAMS: false,
  // [14] Hero selection game mode name display
  DOTA_DEFAULT_UI_HERO_SELECTION_GAME_NAME: false,
  // [15] Hero selection clock
  DOTA_DEFAULT_UI_HERO_SELECTION_CLOCK: false,
  // [16] Top-left menu buttons in the HUD
  DOTA_DEFAULT_UI_TOP_MENU_BUTTONS: false,
  // [17] Top-left menu buttons in the HUD
  DOTA_DEFAULT_UI_TOP_BAR_BACKGROUND: false,
  // [18] Top-bar Radiant players
  DOTA_DEFAULT_UI_TOP_BAR_RADIANT_TEAM: false,
  // [19] Top-bar Dire players
  DOTA_DEFAULT_UI_TOP_BAR_DIRE_TEAM: false,
  // [20] Top-bar score
  DOTA_DEFAULT_UI_TOP_BAR_SCORE: false,
  // [21] Endgame scoreboard
  DOTA_DEFAULT_UI_ENDGAME: false,
  // [22] Endgame chat
  DOTA_DEFAULT_UI_ENDGAME_CHAT: false,
  // [23] Quick stats (KDA/CS) at top-left
  DOTA_DEFAULT_UI_QUICK_STATS: false,
  // [24] Pregame "strategy time" UI
  DOTA_DEFAULT_UI_PREGAME_STRATEGYUI: false,
  // [25] Kill-cam
  DOTA_DEFAULT_UI_KILLCAM: false,
  // [26] Top-bar HUD (?)
  DOTA_DEFAULT_UI_TOP_BAR: false,
  // [27] Render custom UI elements in front of HUD
  DOTA_DEFAULT_UI_CUSTOMUI_BEHIND_HUD_ELEMENTS: true,
  // [28] ?
  DOTA_DEFAULT_UI_ELEMENT_COUNT: false,
};

export const COMBOS = new CombosCollection();
export const ABILITIES_KV = new AbilitiesCollection();

export class CustomUIManifest extends Component {
  constructor() {
    super();

    Object.entries(UI_CONFIG).forEach(([key, value]) => {
      if (value != null) {
        const enumValue = DotaDefaultUIElement_t[key as keyof typeof DotaDefaultUIElement_t];

        UI.setUI(enumValue, value);
      }
    });

    COMBOS.load();
    ABILITIES_KV.load();

    this.debug("init");
  }
}

//   context.customUIManifest = new CustomUIManifest();
// })(GameUI.CustomUIConfig(), this);

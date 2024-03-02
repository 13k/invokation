namespace invk {
  export namespace Constants {
    export const META = {
      version: "v0.5.2",
      url: "https://github.com/13k/invokation",
      changelogUrl: "https://github.com/13k/invokation/blob/main/CHANGELOG.md",
    };

    export const UI_CONFIG: { [K in keyof typeof DotaDefaultUIElement_t]: boolean } = {
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_INVALID: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_TOP_TIMEOFDAY: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_TOP_HEROES: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_FLYOUT_SCOREBOARD: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_ACTION_PANEL: true,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_ACTION_MINIMAP: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_INVENTORY_PANEL: true,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_INVENTORY_SHOP: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_INVENTORY_ITEMS: true,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_INVENTORY_QUICKBUY: true,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_INVENTORY_COURIER: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_INVENTORY_PROTECT: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_INVENTORY_GOLD: true,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS: true,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_SHOP_COMMONITEMS: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_HERO_SELECTION_TEAMS: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_HERO_SELECTION_GAME_NAME: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_HERO_SELECTION_CLOCK: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_HERO_SELECTION_HEADER: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_TOP_MENU_BUTTONS: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_TOP_BAR_BACKGROUND: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_TOP_BAR_RADIANT_TEAM: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_TOP_BAR_DIRE_TEAM: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_TOP_BAR_SCORE: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_ENDGAME: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_ENDGAME_CHAT: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_QUICK_STATS: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_PREGAME_STRATEGYUI: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_KILLCAM: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_FIGHT_RECAP: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_TOP_BAR: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_CUSTOMUI_BEHIND_HUD_ELEMENTS: true,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_AGHANIMS_STATUS: false,
      // biome-ignore lint/style/useNamingConvention: builtin type
      DOTA_DEFAULT_UI_ELEMENT_COUNT: false,
    };
  }
}

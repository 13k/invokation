"use strict";

((global, context) => {
  const { Popup } = context;

  class PopupDebug extends Popup {
    Debug() {
      this.debug("------------------------------ Debug() ------------------------------");

      const { layout } = global.Const.COMPONENTS.POPUPS.TEXT_ENTRY;

      this.showPopup(this.$ctx, "popup-text-entry-debug", layout, {
        channel: "popup-text-entry-debug-channel",
        title: "Shitty Wizard",
        description: "A profitable engagement!",

        // image: "s2r://panorama/images/dpc/favorite_star_psd.vtex",

        // econItem: 13562,
        // econItemStyle: 0,

        hero: "npc_dota_hero_invoker",
        // heroId: 74,
        heroStyle: "portrait",
        heroPersona: "npc_dota_hero_invoker_persona1",

        // ability: "invoker_sun_strike",
        // abilityId: 5386,
        // abilityLevel: 7,

        // item: "item_blink",
      });

      this.debug("---------------------------------------------------------------------");
    }
  }

  context.popup = new PopupDebug();
})(GameUI.CustomUIConfig(), this);

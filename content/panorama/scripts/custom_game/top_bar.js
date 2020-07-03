"use strict";

(function (_global, context) {
  var CreateComponent = context.CreateComponent;

  var POPUP_GAME_INFO_LAYOUT = "file://{resources}/layout/custom_game/popups/popup_game_info.xml";

  var TopBar = CreateComponent({
    constructor: function TopBar() {
      TopBar.super.call(this);
      this.debug("init");
    },

    // ----- UI methods -----

    ShowGameInfo: function () {
      this.debug("ShowGameInfo()");
      return this.showPopup(this.$ctx, "PopupGameInfo", POPUP_GAME_INFO_LAYOUT);
    },
  });

  context.topBar = new TopBar();
})(GameUI.CustomUIConfig(), this);

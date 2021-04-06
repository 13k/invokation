"use strict";

((global, context) => {
  const { Component } = context;
  const { EVENTS, LAYOUTS } = global.Const;

  class TopBar extends Component {
    constructor() {
      super();
      this.debug("init");
    }

    // ----- UI methods -----

    ShowGameInfo() {
      this.debug("ShowGameInfo()");
      return this.showPopup(this.$ctx, "PopupGameInfo", LAYOUTS.POPUPS.GAME_INFO);
    }

    TogglePicker() {
      this.debug("TogglePicker()");
      return this.sendClientSide(EVENTS.PICKER_TOGGLE);
    }
  }

  context.topBar = new TopBar();
})(GameUI.CustomUIConfig(), this);

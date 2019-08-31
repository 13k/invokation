"use strict";

(function(global, context) {
  var EVENTS = global.Const.EVENTS;
  var CreateComponent = context.CreateComponent;

  var TopBar = CreateComponent({
    constructor: function TopBar() {
      TopBar.super.call(this);

      this.debug("init");
    },

    ToggleGameInfo: function() {
      this.debug("ToggleGameInfo()");
      this.sendClientSide(EVENTS.META_GAME_INFO_TOGGLE);
    },
  });

  context.topBar = new TopBar();
})(GameUI.CustomUIConfig(), this);

"use strict";

(function(global, context) {
  var META = global.Const.META;
  var CreateComponent = context.CreateComponent;

  var GameInfo = CreateComponent({
    constructor: function GameInfo() {
      GameInfo.super.call(this, {
        elements: {
          versionLabel: "GameInfoVersionLabel",
        },
        customEvents: {
          "!META_GAME_INFO_TOGGLE": "onToggle",
        },
      });

      this.renderInfo();
      this.debug("init");
    },

    renderInfo: function() {
      this.$versionLabel.text = META.VERSION;
    },

    onToggle: function(payload) {
      this.debug("onToggle()", payload);
      this.Toggle();
    },

    isOpen: function() {
      return !this.$ctx.BHasClass("Hidden");
    },

    Toggle: function() {
      if (this.isOpen()) {
        this.Close();
      } else {
        this.Open();
      }
    },

    Open: function() {
      this.$ctx.RemoveClass("Hidden");
    },

    Close: function() {
      this.$ctx.AddClass("Hidden");
    },

    openURL: function(url) {
      return this.dispatch(this.$ctx, "ExternalBrowserGoToURL", url);
    },

    OpenURL: function() {
      return this.openURL(META.URL);
    },

    OpenChangelogURL: function() {
      return this.openURL(META.CHANGELOG_URL);
    },
  });

  context.gameInfo = new GameInfo();
})(GameUI.CustomUIConfig(), this);

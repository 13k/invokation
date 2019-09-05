"use strict";

(function(global, context) {
  var META = global.Const.META;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var CreateComponent = context.CreateComponent;

  var PopupGameInfo = CreateComponent({
    constructor: function PopupGameInfo() {
      PopupGameInfo.super.call(this, {
        elements: {
          versionLabel: "GameInfoVersionLabel",
        },
      });

      this.render();
      this.debug("init");
    },

    // ----- Event handlers -----

    onLoad: function() {
      this.debug("onLoad()");
      this.render();
    },

    // ----- Helpers -----

    openURL: function(url) {
      return this.openExternalURL(this.$ctx, url);
    },

    // ----- Action runners -----

    render: function() {
      var seq = new ParallelSequence().SetAttribute(this.$versionLabel, "text", META.VERSION);

      this.debugFn(function() {
        return ["render()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    // ----- UI methods -----

    Close: function() {
      this.closePopup(this.$ctx);
    },

    OpenHomepageURL: function() {
      return this.openURL(META.URL);
    },

    OpenChangelogURL: function() {
      return this.openURL(META.CHANGELOG_URL);
    },
  });

  context.popup = new PopupGameInfo();
})(GameUI.CustomUIConfig(), this);

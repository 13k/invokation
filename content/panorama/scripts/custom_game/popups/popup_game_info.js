"use strict";

((global, context) => {
  const { Component } = context;
  const { ParallelSequence } = global.Sequence;
  const { META } = global.Const;

  class PopupGameInfo extends Component {
    constructor() {
      super({
        elements: {
          versionLabel: "version-label",
        },
      });

      this.render();
      this.debug("init");
    }

    // ----- Event handlers -----

    onLoad() {
      this.debug("onLoad()");
      this.render();
    }

    // ----- Helpers -----

    openURL(url) {
      return this.openExternalURL(this.$ctx, url);
    }

    // ----- Action runners -----

    render() {
      const seq = new ParallelSequence().SetAttribute(this.$versionLabel, "text", META.VERSION);

      this.debugFn(() => ["render()", { actions: seq.size() }]);

      return seq.Start();
    }

    // ----- UI methods -----

    Close() {
      this.closePopup(this.$ctx);
    }

    OpenHomepageURL() {
      return this.openURL(META.URL);
    }

    OpenChangelogURL() {
      return this.openURL(META.CHANGELOG_URL);
    }
  }

  context.popup = new PopupGameInfo();
})(GameUI.CustomUIConfig(), this);

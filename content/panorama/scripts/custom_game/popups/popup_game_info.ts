"use strict";

((global, context) => {
  const { Popup } = context;
  const { Sequence } = global.Sequence;
  const { META } = global.Const;

  class PopupGameInfo extends Popup {
    constructor() {
      super({
        elements: {
          version: "version-label",
        },
      });
    }

    render() {
      const seq = new Sequence().SetText(this.$version, META.VERSION);

      this.debugFn(() => ["render()", { actions: seq.length }]);

      return seq.Start();
    }

    openURL(url) {
      return this.openExternalURL(this.$ctx, url);
    }

    openHomepageURL() {
      return this.openURL(META.URL);
    }

    openChangelogURL() {
      return this.openURL(META.CHANGELOG_URL);
    }
  }

  context.popup = new PopupGameInfo();
})(GameUI.CustomUIConfig(), this);

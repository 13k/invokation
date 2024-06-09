import { META } from "@invokation/panorama-lib/meta";

import type { Elements } from "../component";
import { Component } from "../component";

export interface PopupGameInfoElements extends Elements {
  versionLabel: LabelPanel;
  btnClose: Button;
  btnOpenHomepage: Button;
  btnOpenChangelog: Button;
}

export type { PopupGameInfo };

class PopupGameInfo extends Component<PopupGameInfoElements> {
  constructor() {
    super({
      elements: {
        versionLabel: "GameInfoVersionLabel",
        btnClose: "GameInfoClose",
        btnOpenHomepage: "GameInfoOpenHomepage",
        btnOpenChangelog: "GameInfoOpenChangelog",
      },
      panelEvents: {
        $: {
          oncancel: () => this.close(),
        },
        btnClose: {
          onactivate: () => this.close(),
        },
        btnOpenHomepage: {
          onactivate: () => this.openHomepageUrl(),
        },
        btnOpenChangelog: {
          onactivate: () => this.openChangelogUrl(),
        },
      },
    });

    this.debug("init");
  }

  // ----- Event handlers -----

  override onLoad(): void {
    this.debug("onLoad()");
    this.render();
  }

  // ----- Helpers -----

  render(): void {
    this.elements.versionLabel.text = META.version;
  }

  close(): void {
    this.closePopup(this.panel);
  }

  openHomepageUrl(): void {
    this.openUrl(this.panel, META.url);
  }

  openChangelogUrl(): void {
    this.openUrl(this.panel, META.changelogUrl);
  }
}

(() => {
  new PopupGameInfo();
})();

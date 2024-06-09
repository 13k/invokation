import type { Elements } from "./component";
import { Component } from "./component";
import { LayoutId } from "./layout";

export interface TopBarElements extends Elements {
  btnShowGameInfo: Button;
}

enum PanelId {
  PopupGameInfo = "PopupGameInfo",
}

export type { TopBar };

class TopBar extends Component<TopBarElements> {
  constructor() {
    super({
      elements: {
        btnShowGameInfo: "BtnShowGameInfo",
      },
      panelEvents: {
        btnShowGameInfo: { onactivate: () => this.onBtnShowGameInfo() },
      },
    });

    this.debug("init");
  }

  // ----- UI methods -----

  onBtnShowGameInfo(): void {
    this.debug("ShowGameInfo()");
    this.showPopup(this.panel, LayoutId.PopupGameInfo, PanelId.PopupGameInfo);
  }
}

(() => {
  new TopBar();
})();

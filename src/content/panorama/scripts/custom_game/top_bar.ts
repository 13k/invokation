import type { Elements } from "./component";
import { Component } from "./component";
import { LayoutId } from "./layout";

export interface TopBarElements extends Elements {
  btnShowGameInfo: Button;
  btnQuit: Button;
}

enum PanelId {
  PopupGameInfo = "popup-game-info",
}

export type { TopBar };

class TopBar extends Component<TopBarElements> {
  constructor() {
    super({
      elements: {
        btnShowGameInfo: "btn-game-info",
        btnQuit: "btn-quit",
      },
      panelEvents: {
        btnShowGameInfo: { onactivate: () => this.onBtnShowGameInfo() },
        btnQuit: { onactivate: () => this.onBtnQuit() },
      },
    });

    this.debug("init");
  }

  // ----- UI methods -----

  onBtnShowGameInfo(): void {
    this.debug("onBtnShowGameInfo");
    this.showPopup(this.panel, LayoutId.PopupGameInfo, PanelId.PopupGameInfo);
  }

  onBtnQuit(): void {
    this.debug("onBtnQuit");

    Game.LeaveCurrentGame();
  }
}

(() => {
  new TopBar();
})();

import { CustomGameEvent } from "@invokation/panorama-lib/custom_events";

import type { Elements } from "./component";
import { Component } from "./component";
import { LayoutId } from "./layout";

export interface TopBarElements extends Elements {
  btnShowGameInfo: Button;
  btnQuit: Button;
}

enum PanelId {
  PopupGameInfo = "PopupGameInfo",
}

enum CssClass {
  Netgraph = "Netgraph",
}

export type { TopBar };

class TopBar extends Component<TopBarElements> {
  constructor() {
    super({
      elements: {
        btnShowGameInfo: "BtnShowGameInfo",
        btnQuit: "BtnQuit",
      },
      panelEvents: {
        btnShowGameInfo: { onactivate: () => this.onBtnShowGameInfo() },
        btnQuit: { onactivate: () => this.onBtnQuit() },
      },
    });

    if (Game.GetConvarBool("dota_hud_netgraph")) {
      this.panel.AddClass(CssClass.Netgraph);
    }

    this.debug("init");
  }

  // ----- UI methods -----

  onBtnShowGameInfo(): void {
    this.debug("onBtnShowGameInfo");
    this.showPopup(this.panel, LayoutId.PopupGameInfo, PanelId.PopupGameInfo);
  }

  onBtnQuit(): void {
    this.debug("onBtnQuit");
    this.sendServer(CustomGameEvent.PlayerQuitRequest, {});
  }
}

(() => {
  new TopBar();
})();

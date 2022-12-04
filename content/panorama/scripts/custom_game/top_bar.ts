import type { Elements as CElements } from "../lib/component";

export type Elements = CElements;

const { Component, Layout } = GameUI.CustomUIConfig();

enum PanelID {
  PopupGameInfo = "PopupGameInfo",
}

class TopBar extends Component<Elements> {
  constructor() {
    super();
    this.debug("init");
  }

  // ----- UI methods -----

  ShowGameInfo(): void {
    this.debug("ShowGameInfo()");
    this.showPopup(this.panel, Layout.ID.PopupGameInfo, PanelID.PopupGameInfo);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new TopBar();

export type { TopBar };

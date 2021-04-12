// const { Component } = context;
// const { COMPONENTS, EVENTS } = global.Const;

import { Component } from "./lib/component";

const POPUP_GAME_INFO_ID = "popup-game-info";
const POPUP_DEBUG_ID = "popup-debug";

class TopBar extends Component {
  constructor() {
    super();
    this.debug("init");
  }

  // ----- UI methods -----

  ShowGameInfo() {
    this.debug("ShowGameInfo()");

    const { layout } = COMPONENTS.POPUPS.GAME_INFO;

    return this.showPopup(this.$ctx, POPUP_GAME_INFO_ID, layout);
  }

  TogglePicker() {
    this.debug("TogglePicker()");

    return this.sendClientSide(EVENTS.PICKER_TOGGLE);
  }

  ShowDebug() {
    this.debug("ShowDebug()");

    const { layout } = COMPONENTS.POPUPS.DEBUG;

    return this.showPopup(this.$ctx, POPUP_DEBUG_ID, layout);
  }
}

//   context.topbar = new TopBar();
// })(GameUI.CustomUIConfig(), this);

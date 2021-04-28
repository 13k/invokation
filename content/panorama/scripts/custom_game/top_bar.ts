import { Component } from "./lib/component";
import { ComponentLayout } from "./lib/const/component";
import { CustomEvent } from "./lib/const/events";
import { CustomEvents } from "./lib/custom_events";
import { UIEvents } from "./lib/ui_events";

export type Inputs = never;
export type Outputs = never;

const POPUP_GAME_INFO_ID = "popup-game-info";
const POPUP_DEBUG_ID = "popup-debug";

export class TopBar extends Component {
  ShowGameInfo(): void {
    this.debug("ShowGameInfo()");

    UIEvents.showPopup(POPUP_GAME_INFO_ID, ComponentLayout.PopupGameInfo);
  }

  TogglePicker(): void {
    this.debug("TogglePicker()");

    CustomEvents.sendClientSide(CustomEvent.PICKER_TOGGLE);
  }

  ShowDebug(): void {
    this.debug("ShowDebug()");

    UIEvents.showPopup(POPUP_DEBUG_ID, ComponentLayout.PopupDebug);
  }
}

//   context.topbar = new TopBar();
// })(GameUI.CustomUIConfig(), this);

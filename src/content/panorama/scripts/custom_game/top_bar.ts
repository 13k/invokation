import type { CombatLogState } from "@invokation/panorama-lib/custom_events";
import { GameEvent } from "@invokation/panorama-lib/custom_events";

import type { Elements } from "./component";
import { Component } from "./component";
import { LayoutId } from "./layout";

export interface TopBarElements extends Elements {
  btnShowGameInfo: Button;
  btnCombatLog: Button;
  btnQuit: Button;
}

enum PanelId {
  PopupGameInfo = "popup-game-info",
}

enum CssClass {
  CombatLogOpen = "combat-log-open",
}

class TopBar extends Component<TopBarElements> {
  constructor() {
    super({
      elements: {
        btnShowGameInfo: "btn-game-info",
        btnCombatLog: "btn-combat-log",
        btnQuit: "btn-quit",
      },
      panelEvents: {
        btnShowGameInfo: { onactivate: () => this.onBtnShowGameInfo() },
        btnCombatLog: { onactivate: () => this.onBtnCombatLog() },
        btnQuit: { onactivate: () => this.onBtnQuit() },
      },
      customEvents: {
        [GameEvent.CombatLogState]: (payload) => this.onCombatLogState(payload),
      },
    });

    this.debug("init");
  }

  onBtnShowGameInfo(): void {
    this.debug("onBtnShowGameInfo");
    this.showPopup(this.panel, LayoutId.PopupGameInfo, PanelId.PopupGameInfo);
  }

  onBtnCombatLog(): void {
    this.debug("onBtnCombatLog");
    this.sendClientSide(GameEvent.CombatLogToggle, {});
  }

  onCombatLogState(payload: NetworkedData<CombatLogState>): void {
    this.debug("onCombatLogState", payload);

    if (payload.open) {
      this.panel.AddClass(CssClass.CombatLogOpen);
    } else {
      this.panel.RemoveClass(CssClass.CombatLogOpen);
    }
  }

  onBtnQuit(): void {
    this.debug("onBtnQuit");

    Game.LeaveCurrentGame();
  }
}

export type { TopBar };

(() => {
  new TopBar();
})();

import { ComponentLayout } from "../lib/const/component";
import { UIEvents } from "../lib/ui_events";
import { Inputs as BaseInputs, Outputs as BaseOutputs, Popup } from "./popup";

export type Inputs = BaseInputs;
export type Outputs = BaseOutputs;

export class PopupDebug extends Popup<never> {
  render(): void {
    return;
  }

  Debug(): void {
    this.debug("------------------------------ Debug() ------------------------------");

    const params = {
      channel: "popup-text-entry-debug-channel",
      title: "Shitty Wizard",
      description: "A profitable engagement!",

      // image: "s2r://panorama/images/dpc/favorite_star_psd.vtex",

      // econItem: 13562,
      // econItemStyle: 0,

      hero: "npc_dota_hero_invoker",
      // heroID: 74,
      heroStyle: "portrait",

      // ability: "invoker_sun_strike",

      // item: "item_blink",
    };

    UIEvents.showPopup("popup-text-entry-debug", ComponentLayout.PopupTextEntry, params);

    this.debug("---------------------------------------------------------------------");
  }
}

//   context.popup = new PopupDebug();
// })(GameUI.CustomUIConfig(), this);

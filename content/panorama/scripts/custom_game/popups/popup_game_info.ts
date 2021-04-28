import { META } from "../lib/const/meta";
import { SerialSequence } from "../lib/sequence";
import { UIEvents } from "../lib/ui_events";
import { Inputs as BaseInputs, Outputs as BaseOutputs, Popup } from "./popup";

export type Inputs = BaseInputs;
export type Outputs = BaseOutputs;

interface Elements {
  version: LabelPanel;
}

export class PopupGameInfo extends Popup<never> {
  #elements: Elements;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      version: "version-label",
    });
  }

  render(): void {
    const seq = new SerialSequence().SetText(this.#elements.version, META.version);

    this.debugFn(() => ["render()", { actions: seq.length }]);

    seq.run();
  }

  openHomepageURL(): void {
    UIEvents.openExternalURL(META.url);
  }

  openChangelogURL(): void {
    UIEvents.openExternalURL(META.changelogUrl);
  }
}

//   context.popup = new PopupGameInfo();
// })(GameUI.CustomUIConfig(), this);

import { map } from "lodash";
import { CustomEvent, PopupAbilityPickerSubmitEvent } from "../lib/const/events";
import { CustomEvents } from "../lib/custom_events";
import { SPELL_ABILITIES } from "../lib/invoker";
import { PanelEvent } from "../lib/panel_events";
import { RunFunctionAction, SerialSequence } from "../lib/sequence";
import { Inputs as BaseInputs, Outputs as BaseOutputs, Popup } from "./popup";

export type Inputs = BaseInputs;
export type Outputs = BaseOutputs;

interface Elements {
  abilities: Panel;
}

const CLASSES = {
  ABILITY: "ability",
  ABILITY_HIGHLIGHT: "highlighted",
};

const abilityElemID = (abilityName: string) => `ability-${abilityName}`;

export class PopupInvokerAbilityPicker extends Popup<never> {
  #elements: Elements;
  #selected = "";

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      abilities: "abilities",
    });
  }

  render(): void {
    const actions = map(
      SPELL_ABILITIES,
      (ability) => new RunFunctionAction(() => this.createImage(this.#elements.abilities, ability))
    );

    const seq = new SerialSequence().Action(...actions);

    this.debugFn(() => ["render()", { actions: seq.length }]);

    seq.run();
  }

  createImage(parent: Panel, abilityName: string): void {
    const id = abilityElemID(abilityName);

    this.createAbilityImage(parent, id, abilityName, {
      classes: [CLASSES.ABILITY],
      events: {
        onactivate: this.onImageActivate.bind(this),
      },
    });
  }

  onImageActivate(event: PanelEvent<AbilityImage>): void {
    this.debug("onImageActivate()", event);
    this.select(event.panel);
  }

  select(panel: AbilityImage): void {
    this.#selected = panel.abilityname;
    this.submit();
  }

  submit(): void {
    const payload: PopupAbilityPickerSubmitEvent = {
      channel: this.channel,
      ability: this.#selected,
    };

    this.debug("submit()", payload);

    CustomEvents.sendClientSide(CustomEvent.POPUP_ABILITY_PICKER_SUBMIT, payload);

    this.close();
  }
}

//   context.popup = new PopupInvokerAbilityPicker();
// })(GameUI.CustomUIConfig(), this);

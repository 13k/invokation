<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/popups/popup_invoker_ability_picker.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/popups/popups_shared.css" />
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/popups/popup_invoker_ability_picker.css" />
  </styles>

  <Popup class="root PopupPanel" popupbackground="dim" onload="popup.load()" oncancel="popup.close()">
    <Panel class="header">
      <Label class="choice-label" text="#invokation_ability_picker_choose" />
    </Panel>

    <Panel id="abilities" />

    <Panel class="PopupButtonRow">
      <Button class="PopupButton" onactivate="popup.close()">
        <Label text="#DOTA_Close" />
      </Button>
    </Panel>
  </Popup>
</root>
</layout>

<script lang="ts">
import { map } from "lodash";

import { CustomEvent, PopupAbilityPickerSubmitEvent } from "../../scripts/lib/const/events";
import { CustomEvents } from "../../scripts/lib/custom_events";
import { SPELL_ABILITIES } from "../../scripts/lib/invoker";
import { PanelEvent } from "../../scripts/lib/panel_events";
import { Inputs as BaseInputs, Outputs as BaseOutputs, Popup } from "../../scripts/lib/popup";
import { RunFunctionAction, SerialSequence } from "../../scripts/lib/sequence";

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

export default class PopupInvokerAbilityPicker extends Popup<never> {
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

global.popup = new PopupInvokerAbilityPicker();
</script>

<style lang="scss">
.root {
  flow-children: down;
  padding: 0 0 20px;
  align: center center;
}

.header {
  flow-children: right;
  width: 100%;
  padding: 16px 16px 12px;
}

.choice-label {
  color: #bfd2ee;
  font-size: 22px;
  letter-spacing: 2px;
  text-align: left;
  text-transform: uppercase;
  text-overflow: shrink;
  vertical-align: center;
}

#abilities {
  flow-children: right-wrap;
  padding: 14px;

  .ability {
    width: 50px;
    height: 50px;
    margin-right: 8px;
    margin-bottom: 4px;
    box-shadow: #6ad4 -1px -1px 2px 2px;

    &:disabled {
      opacity: 0.2;
      saturation: 0;
    }

    &:enabled:hover {
      brightness: 2;
      contrast: 0.95;
      saturation: 1;
    }

    &.highlighted {
      box-shadow: 0 0 8px #0ff;
    }
  }
}
</style>

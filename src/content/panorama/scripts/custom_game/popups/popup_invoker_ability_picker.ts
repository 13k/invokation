import { GameEvent } from "@invokation/panorama-lib/custom_events";

import type { Elements, Params } from "../component";
import { Component, ParamType } from "../component";
import { LayoutId } from "../layout";
import type { InvokerSpellCard, InvokerSpellCardOutputs } from "../ui/invoker_spell_card";

export interface PopupInvokerAbilityPickerElements extends Elements {
  abilities: Panel;
  btnClose: Button;
}

export interface PopupInvokerAbilityPickerParams extends Params {
  channel: string;
}

enum PanelId {
  SpellCard = "spell-card",
}

const INVALID_CHANNEL = "<invalid>";
const INVALID_ABILITY = "<invalid>";

export type { PopupInvokerAbilityPicker };

class PopupInvokerAbilityPicker extends Component<
  PopupInvokerAbilityPickerElements,
  never,
  never,
  PopupInvokerAbilityPickerParams
> {
  spellCard: InvokerSpellCard | undefined;
  selected: string = INVALID_ABILITY;

  constructor() {
    super({
      elements: {
        abilities: "PopupInvokerAbilityPickerAbilityList",
        btnClose: "PopupInvokerAbilityPickerClose",
      },
      panelEvents: {
        $: {
          oncancel: () => this.close(),
        },
        btnClose: {
          onactivate: () => this.close(),
        },
      },
      params: {
        channel: { type: ParamType.String, default: INVALID_CHANNEL },
      },
    });

    this.debug("init");
  }

  // ----- Event handlers -----

  override onLoad(): void {
    this.debug("onLoad()", this.params);
    this.render();
  }

  onSelect(payload: InvokerSpellCardOutputs["onSelect"]): void {
    this.debug("onSelect()", payload);
    this.select(payload.ability);
  }

  // ----- Helpers -----

  select(ability: string): void {
    this.selected = ability;
    this.submit();
  }

  render(): void {
    this.spellCard = this.create(
      LayoutId.UiInvokerSpellCard,
      PanelId.SpellCard,
      this.elements.abilities,
    );

    this.spellCard.registerOutputs({ onSelect: this.onSelect.bind(this) });

    this.debug("render()");
  }

  // ----- UI methods -----

  close(): void {
    this.closePopup(this.panel);
  }

  submit(): void {
    const {
      params: { channel },
      selected: ability,
    } = this;

    const payload = { channel, ability };

    this.debug("Submit()", payload);
    this.sendClientSide(GameEvent.PopupAbilityPickerSubmit, payload);
    this.close();
  }
}

(() => {
  new PopupInvokerAbilityPicker();
})();

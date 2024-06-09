import { GameEvent } from "@invokation/panorama-lib/custom_events";

import type { Elements, Params } from "../component";
import { Component, ParamType } from "../component";
import { LayoutId } from "../layout";
import type { ItemPicker, ItemPickerOutputs } from "../ui/item_picker";

export interface PopupItemPickerElements extends Elements {
  itemPickerContainer: Panel;
  btnClose: Button;
}

export interface PopupItemPickerParams extends Params {
  channel: string;
}

enum PanelId {
  ItemPicker = "PopupItemPickerUIItemPicker",
}

const INVALID_CHANNEL = "<invalid>";
const INVALID_ITEM = "<invalid>";

export type { PopupItemPicker };

class PopupItemPicker extends Component<
  PopupItemPickerElements,
  never,
  never,
  PopupItemPickerParams
> {
  selected: string = INVALID_ITEM;
  itemPicker: ItemPicker | undefined;

  constructor() {
    super({
      elements: {
        itemPickerContainer: "PopupItemPickerUIItemPickerContainer",
        btnClose: "PopupItemPickerClose",
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

  onItemSelected(payload: ItemPickerOutputs["onSelect"]): void {
    this.debug("onItemSelected()", payload);

    this.selected = payload.item;

    this.submit();
  }

  // ----- Helpers -----

  render(): void {
    this.itemPicker = this.create(
      LayoutId.UiItemPicker,
      PanelId.ItemPicker,
      this.elements.itemPickerContainer,
    );

    this.itemPicker.registerOutputs({
      onSelect: this.onItemSelected.bind(this),
    });

    this.debug("render()");
  }

  close(): void {
    this.closePopup(this.panel);
  }

  submit(): void {
    const {
      params: { channel },
      selected: item,
    } = this;

    const payload = { channel, item };

    this.debug("Submit()", payload);
    this.sendClientSide(GameEvent.PopupItemPickerSubmit, payload);
    this.close();
  }
}

(() => {
  new PopupItemPicker();
})();

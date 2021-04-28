import { ComponentLayout, COMPONENTS } from "../lib/const/component";
import { CustomEvent, PopupItemPickerSubmitEvent } from "../lib/const/events";
import type { PanelWithComponent } from "../lib/const/panorama";
import { CustomEvents } from "../lib/custom_events";
import type { Outputs as UIItemPickerOutputs, UIItemPicker } from "../ui/item_picker";
import { Inputs as BaseInputs, Outputs as BaseOutputs, Popup } from "./popup";

export type Inputs = BaseInputs;
export type Outputs = BaseOutputs;

interface Elements {
  itemPickerContainer: Panel;
}

const UI_ITEM_PICKER_OUTPUTS = COMPONENTS.UI_ITEM_PICKER.outputs;

const DYN_ELEMS = {
  ITEM_PICKER: {
    id: "item-picker",
  },
};

export class PopupItemPicker extends Popup<never> {
  #elements: Elements;
  #selected = "";
  #itemPicker?: PanelWithComponent<UIItemPicker>;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      itemPickerContainer: "item-picker-container",
    });
  }

  render(): void {
    const { id } = DYN_ELEMS.ITEM_PICKER;

    this.#itemPicker = this.createComponent(
      this.#elements.itemPickerContainer,
      id,
      ComponentLayout.UIItemPicker,
      {
        outputs: {
          [UI_ITEM_PICKER_OUTPUTS.ON_SELECT]: this.onItemSelected,
        },
      }
    );

    this.debug("render()");
  }

  onItemSelected(payload: UIItemPickerOutputs[typeof UI_ITEM_PICKER_OUTPUTS.ON_SELECT]): void {
    this.debug("onItemSelected()", payload);
    this.#selected = payload.item;
    this.submit();
  }

  submit(): void {
    const payload: PopupItemPickerSubmitEvent = {
      channel: this.channel,
      item: this.#selected,
    };

    this.debug("submit()", payload);

    CustomEvents.sendClientSide(CustomEvent.POPUP_ITEM_PICKER_SUBMIT, payload);

    this.close();
  }
}

//   context.popup = new PopupItemPicker();
// })(GameUI.CustomUIConfig(), this);

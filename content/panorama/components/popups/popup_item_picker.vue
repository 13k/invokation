<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/popups/popup_item_picker.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/popups/popups_shared.css" />
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/popups/popup_item_picker.css" />
  </styles>

  <Popup class="root PopupPanel" popupbackground="dim" onload="popup.load()" oncancel="popup.close()">
    <Panel id="item-picker-container" />

    <Panel class="PopupButtonRow">
      <Button class="PopupButton" onactivate="popup.close()">
        <Label text="#DOTA_Close" />
      </Button>
    </Panel>
  </Popup>
</root>
</layout>

<script lang="ts">
import { ComponentLayout, COMPONENTS } from "../../scripts/lib/const/component";
import { CustomEvent, PopupItemPickerSubmitEvent } from "../../scripts/lib/const/events";
import type { PanelWithComponent } from "../../scripts/lib/const/panorama";
import { CustomEvents } from "../../scripts/lib/custom_events";
import { Inputs as BaseInputs, Outputs as BaseOutputs, Popup } from "../../scripts/lib/popup";
import type UIItemPicker from "../ui/item_picker.vue";
import type { Outputs as UIItemPickerOutputs } from "../ui/item_picker.vue";

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

export default class PopupItemPicker extends Popup<never> {
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

global.popup = new PopupItemPicker();
</script>

<style lang="scss">
.root {
  flow-children: down;
  padding: 0 0 20px;
  align: center center;
}
</style>

import type { Elements as CElements } from "../../lib/component";
import type { ItemPicker as TItemPicker } from "../ui/item_picker";

export interface Elements extends CElements {
  itemPickerContainer: Panel;
}

export interface Params {
  channel: string;
}

const { Component, CustomEvents, Layout } = GameUI.CustomUIConfig();

enum PanelID {
  ItemPicker = "PopupItemPickerUIItemPicker",
}

const INVALID_CHANNEL = "<invalid>";
const INVALID_ITEM = "<invalid>";

class PopupItemPicker extends Component<Elements> {
  channel: string;
  selected: string;
  itemPicker?: TItemPicker;

  constructor() {
    super({
      elements: {
        itemPickerContainer: "PopupItemPickerUIItemPickerContainer",
      },
    });

    this.channel = INVALID_CHANNEL;
    this.selected = INVALID_ITEM;

    this.debug("init");
  }

  // ----- Event handlers -----

  onLoad() {
    this.channel = this.panel.GetAttributeString("channel", INVALID_CHANNEL);

    this.debug("onLoad()", { channel: this.channel });
    this.render();
  }

  onItemSelected(payload: { item: string }) {
    this.debug("onItemSelected()", payload);

    this.selected = payload.item;

    this.Submit();
  }

  // ----- Helpers -----

  render() {
    this.itemPicker = this.create(
      Layout.ID.UIItemPicker,
      PanelID.ItemPicker,
      this.elements.itemPickerContainer
    );

    this.itemPicker.Outputs({
      OnSelect: this.onItemSelected.bind(this),
    });

    this.debug("render()");
  }

  // ----- UI methods -----

  Close() {
    this.closePopup(this.panel);
  }

  Submit() {
    const { channel, selected: item } = this;
    const payload = { channel, item };

    this.debug("Submit()", payload);
    this.sendClientSide(CustomEvents.Name.POPUP_ITEM_PICKER_SUBMIT, payload);
    this.Close();
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new PopupItemPicker();

export type { PopupItemPicker };

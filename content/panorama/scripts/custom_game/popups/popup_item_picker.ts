"use strict";

((global, context) => {
  const { Popup } = context;
  const { COMPONENTS, EVENTS } = global.Const;

  const DYN_ELEMS = {
    ITEM_PICKER: {
      id: "item-picker",
    },
  };

  class PopupItemPicker extends Popup {
    constructor() {
      super({
        elements: {
          itemPickerContainer: "item-picker-container",
        },
      });
    }

    render() {
      const { layout, outputs } = COMPONENTS.UI.ITEM_PICKER;
      const { id } = DYN_ELEMS.ITEM_PICKER;

      this.$itemPicker = this.createComponent(this.$itemPickerContainer, id, layout, {
        outputs: {
          [outputs.ON_SELECT]: "onItemSelected",
        },
      });

      this.debug("render()");
    }

    onItemSelected(payload) {
      this.debug("onItemSelected()", payload);
      this.selected = payload.item;
      this.submit();
    }

    submit() {
      const payload = {
        channel: this.channel,
        item: this.selected,
      };

      this.debug("submit()", payload);
      this.sendClientSide(EVENTS.POPUP_ITEM_PICKER_SUBMIT, payload);
      this.close();
    }
  }

  context.popup = new PopupItemPicker();
})(GameUI.CustomUIConfig(), this);

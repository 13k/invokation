"use strict";

((global, context) => {
  const { Component } = context;
  const { EVENTS, LAYOUTS } = global.Const;

  const DYN_ELEMS = {
    ITEM_PICKER: {
      id: "item-picker",
    },
  };

  class PopupItemPicker extends Component {
    constructor() {
      super({
        elements: {
          itemPickerContainer: "item-picker-container",
        },
      });

      this.debug("init");
    }

    // ----- Event handlers -----

    onLoad() {
      this.channel = this.$ctx.GetAttributeString("channel", "<invalid>");
      this.debug("onLoad()", { channel: this.channel });
      this.render();
    }

    onItemSelected(payload) {
      this.debug("onItemSelected()", payload);
      this.selected = payload.item;
      this.Submit();
    }

    // ----- Helpers -----

    render() {
      const { id } = DYN_ELEMS.ITEM_PICKER;

      this.$itemPicker = this.createComponent(
        this.$itemPickerContainer,
        id,
        LAYOUTS.UI.ITEM_PICKER,
        {
          outputs: {
            OnSelect: "onItemSelected",
          },
        }
      );

      this.debug("render()");
    }

    // ----- UI methods -----

    Close() {
      this.closePopup(this.$ctx);
    }

    Submit() {
      this.debug("Submit()", this.selected);

      this.sendClientSide(EVENTS.POPUP_ITEM_PICKER_SUBMIT, {
        channel: this.channel,
        item: this.selected,
      });

      this.Close();
    }
  }

  context.popup = new PopupItemPicker();
})(GameUI.CustomUIConfig(), this);

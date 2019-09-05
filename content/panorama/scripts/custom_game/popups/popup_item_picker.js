"use strict";

(function(global, context) {
  var EVENTS = global.Const.EVENTS;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;

  var ITEM_PICKER_LAYOUT = "file://{resources}/layout/custom_game/ui/item_picker.xml";
  var ITEM_PICKER_ID = "PopupItemPickerUIItemPicker";

  var PopupItemPicker = CreateComponent({
    constructor: function PopupItemPicker() {
      PopupItemPicker.super.call(this, {
        elements: {
          itemPickerContainer: "PopupItemPickerUIItemPickerContainer",
        },
      });

      this.debug("init");
    },

    // ----- Event handlers -----

    onLoad: function() {
      this.channel = this.$ctx.GetAttributeString("channel", "<invalid>");
      this.debug("onLoad()", { channel: this.channel });
      this.render();
    },

    onItemSelected: function(payload) {
      this.debug("onItemSelected()", payload);
      this.selected = payload.item;
    },

    // ----- Helpers -----

    render: function() {
      this.$itemPicker = CreatePanelWithLayout(
        this.$itemPickerContainer,
        ITEM_PICKER_ID,
        ITEM_PICKER_LAYOUT
      );

      this.$itemPicker.component.Outputs({
        OnSelect: this.handler("onItemSelected"),
      });

      this.debug("render()");
    },

    // ----- UI methods -----

    Close: function() {
      this.closePopup(this.$ctx);
    },

    Submit: function() {
      this.debug("Submit()", this.selected);

      this.sendClientSide(EVENTS.POPUP_ITEM_PICKER_SUBMIT, {
        channel: this.channel,
        item: this.selected,
      });

      this.Close();
    },
  });

  context.popup = new PopupItemPicker();
})(GameUI.CustomUIConfig(), this);

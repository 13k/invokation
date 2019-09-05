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

    onItemSelected: function(payload) {
      this.debug("onItemSelected()", payload);
      this.selected = payload.item;
    },

    onLoad: function() {
      this.render();
    },

    render: function() {
      this.channel = this.$ctx.GetAttributeString("channel", "<invalid>");

      this.$itemPicker = CreatePanelWithLayout(
        this.$itemPickerContainer,
        ITEM_PICKER_ID,
        ITEM_PICKER_LAYOUT
      );

      this.$itemPicker.component.Outputs({
        OnSelect: this.handler("onItemSelected"),
      });

      this.debug("render() -- channel:", this.channel);
    },

    Submit: function() {
      this.debug("Submit()", this.selected);

      this.sendClientSide(EVENTS.POPUP_ITEM_PICKER_SUBMIT, {
        channel: this.channel,
        item: this.selected,
      });

      this.Close();
    },

    Close: function() {
      this.dispatch(this.$ctx, "UIPopupButtonClicked");
    },
  });

  context.popup = new PopupItemPicker();
})(GameUI.CustomUIConfig(), this);

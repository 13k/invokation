"use strict";

(function (global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var INVOKER = global.Const.INVOKER;
  var CreateAbilityImage = global.Util.CreateAbilityImage;
  var CreateComponent = context.CreateComponent;

  var ABILITY_CLASS = "PopupInvokerAbilityPickerAbility";
  var ABILITY_HIGHLIGHT_CLASS = "Highlighted";

  var PopupInvokerAbilityPicker = CreateComponent({
    constructor: function PopupInvokerAbilityPicker() {
      PopupInvokerAbilityPicker.super.call(this, {
        elements: {
          abilities: "PopupInvokerAbilityPickerAbilityList",
        },
      });

      this.abilityPanels = {};
      this.debug("init");
    },

    // ----- Event handlers -----

    onLoad: function () {
      this.channel = this.$ctx.GetAttributeString("channel", "<invalid>");
      this.debug("onLoad()", { channel: this.channel });
      this.render();
    },

    onImageActivate: function (imagePanel) {
      this.debug("onImageActivate()", imagePanel.id);
      this.select(imagePanel);
    },

    // ----- Helpers -----

    select: function (imagePanel) {
      var highlighted = this.$abilities.FindChildrenWithClassTraverse(ABILITY_HIGHLIGHT_CLASS);

      _.each(highlighted, function (panel) {
        panel.RemoveClass(ABILITY_HIGHLIGHT_CLASS);
      });

      imagePanel.AddClass(ABILITY_HIGHLIGHT_CLASS);

      this.selected = imagePanel.abilityname;
    },

    render: function () {
      var createAbilityImage = _.chain(this.createAbilityImage)
        .bind(this, this.$abilities)
        .rearg([1, 0])
        .ary(2)
        .value();

      _.each(INVOKER.SPELL_ABILITIES, createAbilityImage);

      this.debug("render()");
    },

    createAbilityImage: function (parent, abilityName) {
      var abilityId =
        "PopupInvokerAbilityPicker" + _.chain(abilityName).camelCase().upperFirst().value();

      var panel = CreateAbilityImage(parent, abilityId, abilityName);

      panel.AddClass(ABILITY_CLASS);
      panel.SetPanelEvent("onactivate", _.partial(this.handler("onImageActivate"), panel));

      this.abilityPanels[abilityName] = panel;

      return panel;
    },

    // ----- UI methods -----

    Close: function () {
      this.closePopup(this.$ctx);
    },

    Submit: function () {
      this.debug("Submit()", this.selected);

      this.sendClientSide(EVENTS.POPUP_ABILITY_PICKER_SUBMIT, {
        channel: this.channel,
        ability: this.selected,
      });

      this.Close();
    },
  });

  context.popup = new PopupInvokerAbilityPicker();
})(GameUI.CustomUIConfig(), this);

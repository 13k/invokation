"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _ } = global;
  const { EVENTS, INVOKER } = global.Const;

  const ABILITY_CLASS = "ability";
  const ABILITY_HIGHLIGHT_CLASS = "highlighted";

  const abilityElemId = (abilityName) => `ability-${abilityName}`;

  class PopupInvokerAbilityPicker extends Component {
    constructor() {
      super({
        elements: {
          abilities: "abilities",
        },
      });

      this.abilityPanels = {};
      this.debug("init");
    }

    // ----- Event handlers -----

    onLoad() {
      this.channel = this.$ctx.GetAttributeString("channel", "<invalid>");
      this.debug("onLoad()", { channel: this.channel });
      this.render();
    }

    onImageActivate(imagePanel) {
      this.debug("onImageActivate()", imagePanel.id);
      this.select(imagePanel);
    }

    // ----- Helpers -----

    select(imagePanel) {
      const highlighted = this.$abilities.FindChildrenWithClassTraverse(ABILITY_HIGHLIGHT_CLASS);

      _.each(highlighted, (panel) => panel.RemoveClass(ABILITY_HIGHLIGHT_CLASS));

      imagePanel.AddClass(ABILITY_HIGHLIGHT_CLASS);

      this.selected = imagePanel.abilityname;
      this.Submit();
    }

    render() {
      const createImage = _.chain(this.createImage)
        .bind(this, this.$abilities)
        .rearg([1, 0])
        .ary(2)
        .value();

      _.each(INVOKER.SPELL_ABILITIES, createImage);

      this.debug("render()");
    }

    createImage(parent, abilityName) {
      const id = abilityElemId(abilityName);
      const panel = this.createAbilityImage(parent, id, abilityName, {
        classes: [ABILITY_CLASS],
      });

      panel.SetPanelEvent("onactivate", _.partial(this.handler("onImageActivate"), panel));

      this.abilityPanels[abilityName] = panel;

      return panel;
    }

    // ----- UI methods -----

    Close() {
      this.closePopup(this.$ctx);
    }

    Submit() {
      this.debug("Submit()", this.selected);

      this.sendClientSide(EVENTS.POPUP_ABILITY_PICKER_SUBMIT, {
        channel: this.channel,
        ability: this.selected,
      });

      this.Close();
    }
  }

  context.popup = new PopupInvokerAbilityPicker();
})(GameUI.CustomUIConfig(), this);

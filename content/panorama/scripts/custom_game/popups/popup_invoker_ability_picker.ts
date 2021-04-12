"use strict";

((global, context) => {
  const { Popup } = context;
  const { lodash: _ } = global;
  const { Sequence, RunFunctionAction } = global.Sequence;
  const { EVENTS, INVOKER } = global.Const;

  const CLASSES = {
    ABILITY: "ability",
    ABILITY_HIGHLIGHT: "highlighted",
  };

  const abilityElemId = (abilityName) => `ability-${abilityName}`;

  class PopupInvokerAbilityPicker extends Popup {
    constructor() {
      super({
        elements: {
          abilities: "abilities",
        },
      });

      this.selected = null;
    }

    render() {
      const actions = _.map(
        INVOKER.SPELL_ABILITIES,
        (ability) => new RunFunctionAction(() => this.createImage(this.$abilities, ability))
      );

      const seq = new Sequence().Action(actions);

      this.debugFn(() => ["render()", { actions: seq.length }]);

      return seq.Start();
    }

    createImage(parent, abilityName) {
      const id = abilityElemId(abilityName);

      return this.createAbilityImage(parent, id, abilityName, {
        classes: [CLASSES.ABILITY],
        events: {
          onactivate: this.handler("onImageActivate"),
        },
      });
    }

    onImageActivate(event) {
      this.debug("onImageActivate()", event);
      this.select(event.panel);
    }

    select(panel) {
      this.selected = panel.abilityname;
      this.submit();
    }

    submit() {
      const payload = {
        channel: this.channel,
        ability: this.selected,
      };

      this.debug("submit()", payload);
      this.sendClientSide(EVENTS.POPUP_ABILITY_PICKER_SUBMIT, payload);
      this.close();
    }
  }

  context.popup = new PopupInvokerAbilityPicker();
})(GameUI.CustomUIConfig(), this);

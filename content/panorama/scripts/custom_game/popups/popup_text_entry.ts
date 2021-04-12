"use strict";

((global, context) => {
  const { Popup } = context;
  const { ParallelSequence } = global.Sequence;
  const { Enum } = global.Util;
  const { EVENTS } = global.Const;

  const DIALOG_VARS = {
    TITLE: "title",
    DESCRIPTION: "description",
  };

  const PopupType = Enum({
    SIMPLE: 1,
    IMAGE: 2,
    ECON_ITEM: 3,
    HERO: 4,
    ABILITY: 5,
    ITEM: 6,
  });

  const TYPE_CLASSES = {
    [PopupType.SIMPLE]: "type-simple",
    [PopupType.IMAGE]: "type-image",
    [PopupType.ECON_ITEM]: "type-econ-item",
    [PopupType.HERO]: "type-hero",
    [PopupType.ABILITY]: "type-ability",
    [PopupType.ITEM]: "type-item",
  };

  const CLASSES = {
    EMPTY_DESCRIPTION: "empty-description",
  };

  class PopupTextEntry extends Popup {
    constructor() {
      super({
        attributes: {
          title: "string",
          description: "string",
          image: "string",
          econItem: "int",
          econItemStyle: "int",
          hero: "string",
          heroId: "int",
          heroStyle: "string",
          heroPersona: "string",
          ability: "string",
          abilityId: "int",
          abilityLevel: "int",
          item: "string",
        },
        elements: {
          textEntry: "text-entry",
          image: "image",
          econItemImage: "econ-item-image",
          heroImage: "hero-image",
          abilityImage: "ability-image",
          itemImage: "item-image",
        },
      });
    }

    // ----- Properties -----

    get type() {
      const { image, econItem, hero, heroId, ability, abilityId, item } = this.attributes;

      if (image) return PopupType.IMAGE;
      if (econItem) return PopupType.ECON_ITEM;
      if (heroId || hero) return PopupType.HERO;
      if (abilityId || ability) return PopupType.ABILITY;
      if (item) return PopupType.ITEM;

      return PopupType.SIMPLE;
    }

    get typeClass() {
      return TYPE_CLASSES[this.type];
    }

    // ----- Helpers -----

    render() {
      const {
        title,
        description,
        image,
        econItem,
        econItemStyle,
        hero,
        heroId,
        heroPersona,
        heroStyle,
        ability,
        abilityId,
        abilityLevel,
        item,
      } = this.attributes;

      const seq = new ParallelSequence()
        .SetDialogVariable(this.$ctx, DIALOG_VARS.TITLE, title)
        .SetDialogVariable(this.$ctx, DIALOG_VARS.DESCRIPTION, description);

      switch (this.type) {
        case PopupType.IMAGE:
          seq.SetImage(this.$image, image);

          break;
        case PopupType.ECON_ITEM:
          seq.SetEconItem(this.$econItemImage, { id: econItem, style: econItemStyle });

          break;
        case PopupType.HERO:
          seq.SetHeroImage(this.$heroImage, {
            id: heroId,
            name: hero,
            style: heroStyle,
            persona: heroPersona,
          });

          break;
        case PopupType.ABILITY:
          seq.SetAbilityImage(this.$abilityImage, {
            id: abilityId,
            name: ability,
            level: abilityLevel,
          });

          break;
        case PopupType.ITEM:
          seq.SetItemImage(this.$itemImage, { name: item });

          break;
      }

      if (this.typeClass) {
        seq.AddClass(this.$ctx, this.typeClass);
      }

      if (!description) {
        seq.AddClass(this.$ctx, CLASSES.EMPTY_DESCRIPTION);
      }

      seq.Focus(this.$textEntry);

      this.debugFn(() => ["render()", { actions: seq.length }]);

      return seq.Start();
    }

    submit() {
      const payload = {
        channel: this.channel,
        text: this.$textEntry.text,
      };

      this.debug("submit()", payload);
      this.sendClientSide(EVENTS.POPUP_TEXT_ENTRY_SUBMIT, payload);
      this.close();
    }
  }

  context.popup = new PopupTextEntry();
})(GameUI.CustomUIConfig(), this);

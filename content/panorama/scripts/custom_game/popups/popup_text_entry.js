"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _ } = global;
  const { EVENTS } = global.Const;

  const PROPERTIES = [
    "channel",
    "title",
    "body",
    "image",
    "econitem",
    "heroid",
    "hero",
    "ability",
    "item",
  ];

  const ICON_TYPES = {
    IMAGE: "IMAGE",
    ECON_ITEM: "ECON_ITEM",
    HERO: "HERO",
    ABILITY: "ABILITY",
    ITEM: "ITEM",
  };

  const ICON_CLASSES = {
    IMAGE: "image-icon-enabled",
    ECON_ITEM: "econ-item-icon-enabled",
    HERO: "hero-icon-enabled",
    ABILITY: "ability-icon-enabled",
    ITEM: "item-icon-enabled",
  };

  class PopupTextEntry extends Component {
    constructor() {
      super({
        elements: {
          textEntry: "text-entry",
          image: "icon-image",
          econItemImage: "econ-item-image",
          heroImage: "hero-image",
          abilityImage: "ability-image",
          itemImage: "item-image",
        },
      });

      this.debug("init");
    }

    // ----- Event handlers -----

    onLoad() {
      this.loadProperties();
      this.debugFn(() => ["onLoad()", _.pick(this, PROPERTIES)]);
      this.render();
    }

    // ----- Helpers -----

    loadProperties() {
      _.each(PROPERTIES, (property) => {
        this[property] = this.$ctx.GetAttributeString(property, "");
      });
    }

    render() {
      let iconType = null;

      this.$ctx.SetDialogVariable("title", this.title);
      this.$ctx.SetDialogVariable("body", this.body);

      if (!_.isEmpty(this.image)) {
        this.$image.SetImage(this.image);
        iconType = ICON_TYPES.IMAGE;
      } else if (!_.isEmpty(this.econitem)) {
        this.$econItemImage.SetItemByDefinition(parseInt(this.econitem) || 0);
        iconType = ICON_TYPES.ECON_ITEM;
      } else if (!_.isEmpty(this.heroid)) {
        this.$heroImage.heroid = parseInt(this.heroid) || 0;
        iconType = ICON_TYPES.HERO;
      } else if (!_.isEmpty(this.hero)) {
        this.$heroImage.heroname = this.hero;
        iconType = ICON_TYPES.HERO;
      } else if (!_.isEmpty(this.ability)) {
        this.$abilityImage.abilityname = this.ability;
        iconType = ICON_TYPES.ABILITY;
      } else if (!_.isEmpty(this.item)) {
        this.$itemImage.itemname = this.item;
        iconType = ICON_TYPES.ITEM;
      }

      if (iconType) {
        this.$ctx.AddClass(ICON_CLASSES[iconType]);
      }

      this.debug("render()");
    }

    // ----- UI methods -----

    Close() {
      this.closePopup(this.$ctx);
    }

    Submit() {
      this.debug("Submit()", this.$textEntry.text);

      this.sendClientSide(EVENTS.POPUP_TEXT_ENTRY_SUBMIT, {
        channel: this.channel,
        text: this.$textEntry.text,
      });

      this.Close();
    }
  }

  context.popup = new PopupTextEntry();
})(GameUI.CustomUIConfig(), this);

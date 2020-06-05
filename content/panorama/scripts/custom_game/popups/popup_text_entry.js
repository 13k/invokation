"use strict";

(function(global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var CreateComponent = context.CreateComponent;

  var PROPERTIES = ["channel", "title", "body", "image", "econitem", "heroid", "hero", "ability", "item"];

  var ICON_CLASSES = {
    IMAGE: "ImageIconEnabled",
    ECON_ITEM: "EconItemIconEnabled",
    HERO: "HeroIconEnabled",
    ABILITY: "AbilityIconEnabled",
    ITEM: "ItemIconEnabled",
  };

  var PopupTextEntry = CreateComponent({
    constructor: function PopupTextEntry() {
      PopupTextEntry.super.call(this, {
        elements: {
          textEntry: "PopupTextEntryTextEntry",
          image: "PopupTextEntryImage",
          econItemImage: "PopupTextEntryEconItemImage",
          heroImage: "PopupTextEntryHeroImage",
          abilityImage: "PopupTextEntryAbilityImage",
          itemImage: "PopupTextEntryItemImage",
        },
      });

      this.debug("init");
    },

    // ----- Event handlers -----

    onLoad: function() {
      this.loadProperties();

      this.debugFn(function() {
        return ["onLoad()", _.pick(this, PROPERTIES)];
      });

      this.render();
    },

    // ----- Helpers -----

    loadProperties: function() {
      _.each(
        PROPERTIES,
        function(property) {
          this[property] = this.$ctx.GetAttributeString(property, "");
        }.bind(this)
      );
    },

    render: function() {
      var iconType;

      this.$ctx.SetDialogVariable("title", this.title);
      this.$ctx.SetDialogVariable("body", this.body);

      if (!_.isEmpty(this.image)) {
        this.$image.SetImage(this.image);
        iconType = "IMAGE";
      } else if (!_.isEmpty(this.econitem)) {
        this.$econItemImage.SetItemByDefinition(parseInt(this.econitem) || 0);
        iconType = "ECON_ITEM";
      } else if (!_.isEmpty(this.heroid)) {
        this.$heroImage.heroid = parseInt(this.heroid) || 0;
        iconType = "HERO";
      } else if (!_.isEmpty(this.hero)) {
        this.$heroImage.heroname = this.hero;
        iconType = "HERO";
      } else if (!_.isEmpty(this.ability)) {
        this.$abilityImage.abilityname = this.ability;
        iconType = "ABILITY";
      } else if (!_.isEmpty(this.item)) {
        this.$itemImage.itemname = this.item;
        iconType = "ITEM";
      }

      if (iconType) {
        this.$ctx.AddClass(ICON_CLASSES[iconType]);
      }

      this.debug("render()");
    },

    // ----- UI methods -----

    Close: function() {
      this.closePopup(this.$ctx);
    },

    Submit: function() {
      this.debug("Submit()", this.$textEntry.text);

      this.sendClientSide(EVENTS.POPUP_TEXT_ENTRY_SUBMIT, {
        channel: this.channel,
        text: this.$textEntry.text,
      });

      this.Close();
    },
  });

  context.popup = new PopupTextEntry();
})(GameUI.CustomUIConfig(), this);

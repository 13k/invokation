namespace invk {
  export namespace Components {
    export namespace Popups {
      export namespace PopupTextEntry {
        export interface Elements extends Component.Elements {
          textEntry: LabelPanel;
          image: ImagePanel;
          econItemImage: EconItemPanel;
          heroImage: HeroImage;
          abilityImage: AbilityImage;
          itemImage: ItemImage;
        }

        export type Inputs = never;
        export type Outputs = never;

        export type Params = {
          [K in keyof typeof Attribute as typeof Attribute[K]]?: string;
        };

        const {
          CustomEvents: { Name: CustomEventName },
          Vendor: { lodash: _ },
        } = GameUI.CustomUIConfig().invk;

        enum Attribute {
          Channel = "channel",
          Title = "title",
          Body = "body",
          Image = "image",
          EconItem = "econitem",
          HeroId = "heroid",
          Hero = "hero",
          Ability = "ability",
          Item = "item",
        }

        enum IconClass {
          IMAGE = "ImageIconEnabled",
          ECON_ITEM = "EconItemIconEnabled",
          HERO = "HeroIconEnabled",
          ABILITY = "AbilityIconEnabled",
          ITEM = "ItemIconEnabled",
        }

        enum DialogVariable {
          Title = "title",
          Body = "body",
        }

        export class PopupTextEntry extends Component.Component<Elements, Inputs, Outputs> {
          attributes: Record<Attribute, string>;

          constructor() {
            super({
              elements: {
                textEntry: "PopupTextEntryTextEntry",
                image: "PopupTextEntryImage",
                econItemImage: "PopupTextEntryEconItemImage",
                heroImage: "PopupTextEntryHeroImage",
                abilityImage: "PopupTextEntryAbilityImage",
                itemImage: "PopupTextEntryItemImage",
              },
            });

            this.attributes = {
              [Attribute.Channel]: "",
              [Attribute.Title]: "",
              [Attribute.Body]: "",
              [Attribute.Image]: "",
              [Attribute.EconItem]: "",
              [Attribute.HeroId]: "",
              [Attribute.Hero]: "",
              [Attribute.Ability]: "",
              [Attribute.Item]: "",
            };

            this.debug("init");
          }

          // ----- Event handlers -----

          onLoad() {
            this.loadAttributes();
            this.debugFn(() => ["onLoad()", this.attributes]);
            this.render();
          }

          // ----- Helpers -----

          loadAttributes() {
            _.each(this.attributes, (_val, property) => {
              this.attributes[property as Attribute] = this.panel.GetAttributeString(property, "");
            });
          }

          render() {
            let iconClass: IconClass | null = null;

            this.panel.SetDialogVariable(DialogVariable.Title, this.attributes[Attribute.Title]);
            this.panel.SetDialogVariable(DialogVariable.Body, this.attributes[Attribute.Body]);

            if (!_.isEmpty(this.attributes[Attribute.Image])) {
              this.elements.image.SetImage(this.attributes[Attribute.Image]);
              iconClass = IconClass.IMAGE;
            } else if (!_.isEmpty(this.attributes[Attribute.EconItem])) {
              const id = _.toInteger(this.attributes[Attribute.EconItem]);
              this.elements.econItemImage.SetItemByDefinition(id);
              iconClass = IconClass.ECON_ITEM;
            } else if (!_.isEmpty(this.attributes[Attribute.HeroId])) {
              const id = _.toInteger(this.attributes[Attribute.HeroId]) as HeroID;
              this.elements.heroImage.heroid = id;
              iconClass = IconClass.HERO;
            } else if (!_.isEmpty(this.attributes[Attribute.Hero])) {
              this.elements.heroImage.heroname = this.attributes[Attribute.Hero];
              iconClass = IconClass.HERO;
            } else if (!_.isEmpty(this.attributes[Attribute.Ability])) {
              this.elements.abilityImage.abilityname = this.attributes[Attribute.Ability];
              iconClass = IconClass.ABILITY;
            } else if (!_.isEmpty(this.attributes[Attribute.Item])) {
              this.elements.itemImage.itemname = this.attributes[Attribute.Item];
              iconClass = IconClass.ITEM;
            }

            if (iconClass) {
              this.panel.AddClass(iconClass);
            }

            this.debug("render()");
          }

          // ----- UI methods -----

          Close() {
            this.closePopup(this.panel);
          }

          Submit() {
            const {
              attributes: { channel },
              elements: {
                textEntry: { text },
              },
            } = this;

            const payload = { channel, text };

            this.debug("Submit()", payload);
            this.sendClientSide(CustomEventName.POPUP_TEXT_ENTRY_SUBMIT, payload);
            this.Close();
          }
        }

        export const component = new PopupTextEntry();
      }
    }
  }
}

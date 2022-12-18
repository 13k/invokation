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

        export interface Params extends Component.Params {
          [Param.Channel]: string;
          [Param.Title]?: string;
          [Param.Body]?: string;
          [Param.Image]?: string;
          [Param.EconItem]?: number;
          [Param.HeroId]?: number;
          [Param.Hero]?: string;
          [Param.Ability]?: string;
          [Param.Item]?: string;
        }

        const {
          CustomEvents: { Name: CustomEventName },
          Vendor: { lodash: _ },
        } = GameUI.CustomUIConfig().invk;

        const { ParamType } = Component;

        enum Param {
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

        export class PopupTextEntry extends Component.Component<Elements, Inputs, Outputs, Params> {
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
              params: {
                [Param.Channel]: { type: ParamType.String, default: "" },
                [Param.Title]: { type: ParamType.String, default: "" },
                [Param.Body]: { type: ParamType.String, default: "" },
                [Param.Image]: { type: ParamType.String, default: "" },
                [Param.EconItem]: { type: ParamType.UInt32, default: 0 },
                [Param.HeroId]: { type: ParamType.UInt32, default: 0 },
                [Param.Hero]: { type: ParamType.String, default: "" },
                [Param.Ability]: { type: ParamType.String, default: "" },
                [Param.Item]: { type: ParamType.String, default: "" },
              },
            });

            this.debug("init");
          }

          // ----- Event handlers -----

          override onLoad(): void {
            this.debugFn(() => ["onLoad()", this.params]);
            this.render();
          }

          // ----- Helpers -----

          render() {
            let iconClass: IconClass | null = null;

            this.panel.SetDialogVariable(DialogVariable.Title, this.params[Param.Title] || "");
            this.panel.SetDialogVariable(DialogVariable.Body, this.params[Param.Body] || "");

            const image = this.params[Param.Image];
            const econItem = this.params[Param.EconItem];
            const heroID = this.params[Param.HeroId];
            const hero = this.params[Param.Hero];
            const ability = this.params[Param.Ability];
            const item = this.params[Param.Item];

            if (_.isString(image) && !_.isEmpty(image)) {
              this.elements.image.SetImage(image);
              iconClass = IconClass.IMAGE;
            } else if (_.isNumber(econItem) && !_.isEmpty(econItem)) {
              this.elements.econItemImage.SetItemByDefinition(econItem);
              iconClass = IconClass.ECON_ITEM;
            } else if (_.isNumber(heroID) && !_.isEmpty(heroID)) {
              this.elements.heroImage.heroid = heroID as HeroID;
              iconClass = IconClass.HERO;
            } else if (_.isString(hero) && !_.isEmpty(hero)) {
              this.elements.heroImage.heroname = hero;
              iconClass = IconClass.HERO;
            } else if (_.isString(ability) && !_.isEmpty(ability)) {
              this.elements.abilityImage.abilityname = ability;
              iconClass = IconClass.ABILITY;
            } else if (_.isString(item) && !_.isEmpty(item)) {
              this.elements.itemImage.itemname = item;
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
              params: { [Param.Channel]: channel },
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

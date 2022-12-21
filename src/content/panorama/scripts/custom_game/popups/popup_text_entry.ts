// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          btnSubmit: Button;
          btnCancel: Button;
        }

        export type Inputs = never;
        export type Outputs = never;

        export interface Params extends Component.Params {
          [Param.Channel]: string;
          [Param.Title]?: string;
          [Param.Body]?: string;
          [Param.Image]?: string;
          [Param.EconItem]?: number;
          [Param.HeroID]?: number;
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
          HeroID = "heroid",
          Hero = "hero",
          Ability = "ability",
          Item = "item",
        }

        enum CssClass {
          BodyEnabled = "BodyEnabled",
          ImageEnabled = "ImageIconEnabled",
          EconItemEnabled = "EconItemIconEnabled",
          HeroEnabled = "HeroIconEnabled",
          AbilityEnabled = "AbilityIconEnabled",
          ItemEnabled = "ItemIconEnabled",
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
                btnSubmit: "PopupTextEntrySubmit",
                btnCancel: "PopupTextEntryCancel",
              },
              panelEvents: {
                textEntry: {
                  oninputsubmit: () => this.Submit(),
                },
                btnSubmit: {
                  onactivate: () => this.Submit(),
                },
                btnCancel: {
                  onactivate: () => this.Close(),
                },
              },
              params: {
                [Param.Channel]: { type: ParamType.String, default: "" },
                [Param.Title]: { type: ParamType.String, default: "" },
                [Param.Body]: { type: ParamType.String, default: "" },
                [Param.Image]: { type: ParamType.String, default: "" },
                [Param.EconItem]: { type: ParamType.UInt32, default: 0 },
                [Param.HeroID]: { type: ParamType.UInt32, default: 0 },
                [Param.Hero]: { type: ParamType.String, default: "" },
                [Param.Ability]: { type: ParamType.String, default: "" },
                [Param.Item]: { type: ParamType.String, default: "" },
              },
            });

            this.setPanelEvent("oncancel", () => this.Close());
            this.debug("init");
          }

          // ----- Event handlers -----

          override onLoad(): void {
            this.debugFn(() => ["onLoad()", this.params]);
            this.render();
          }

          // ----- Helpers -----

          get title(): string | undefined {
            return this.params[Param.Title];
          }

          get body(): string | undefined {
            return this.params[Param.Body];
          }

          get image(): string | undefined {
            return this.params[Param.Image];
          }

          get econItem(): number | undefined {
            return this.params[Param.EconItem];
          }

          get heroID(): number | undefined {
            return this.params[Param.HeroID];
          }

          get hero(): string | undefined {
            return this.params[Param.Hero];
          }

          get ability(): string | undefined {
            return this.params[Param.Ability];
          }

          get item(): string | undefined {
            return this.params[Param.Item];
          }

          get hasBodyElement(): boolean {
            return (
              this.hasBody() ||
              this.hasImage() ||
              this.hasEconItem() ||
              this.hasHeroID() ||
              this.hasHero() ||
              this.hasAbility() ||
              this.hasItem()
            );
          }

          hasBody(): this is { body: string } {
            return this.body != null && this.body !== "";
          }

          hasImage(): this is { image: string } {
            return this.image != null && this.image !== "";
          }

          hasEconItem(): this is { econItem: number } {
            return this.econItem != null && this.econItem > 0;
          }

          hasHeroID(): this is { heroID: number } {
            return this.heroID != null && this.heroID > 0;
          }

          hasHero(): this is { hero: string } {
            return this.hero != null && this.hero !== "";
          }

          hasAbility(): this is { ability: string } {
            return this.ability != null && this.ability !== "";
          }

          hasItem(): this is { item: string } {
            return this.item != null && this.item !== "";
          }

          render() {
            let iconClass: CssClass | null = null;

            this.panel.SetDialogVariable(DialogVariable.Title, this.title || "");
            this.panel.SetDialogVariable(DialogVariable.Body, this.body || "");

            if (this.hasImage()) {
              this.elements.image.SetImage(this.image);
              iconClass = CssClass.ImageEnabled;
            } else if (this.hasEconItem()) {
              this.elements.econItemImage.SetItemByDefinition(this.econItem);
              iconClass = CssClass.EconItemEnabled;
            } else if (this.hasHeroID()) {
              this.elements.heroImage.heroid = this.heroID as HeroID;
              iconClass = CssClass.HeroEnabled;
            } else if (this.hasHero()) {
              this.elements.heroImage.heroname = this.hero;
              iconClass = CssClass.HeroEnabled;
            } else if (this.hasAbility()) {
              this.elements.abilityImage.abilityname = this.ability;
              iconClass = CssClass.AbilityEnabled;
            } else if (this.hasItem()) {
              this.elements.itemImage.itemname = this.item;
              iconClass = CssClass.ItemEnabled;
            }

            if (this.hasBodyElement) {
              this.panel.AddClass(CssClass.BodyEnabled);
            }

            if (iconClass) {
              this.panel.AddClass(iconClass);
            }

            this.elements.textEntry.SetFocus();

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

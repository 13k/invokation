namespace invk {
  export namespace Components {
    export namespace Popups {
      export namespace TextEntry {
        const {
          CustomEvents: { GameEvent },
        } = GameUI.CustomUIConfig().invk;

        import Component = invk.Component.Component;
        import ParamType = invk.Component.ParamType;

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

        enum CssClass {
          BodyEnabled = "BodyEnabled",
          ImageEnabled = "ImageIconEnabled",
          EconItemEnabled = "EconItemIconEnabled",
          HeroEnabled = "HeroIconEnabled",
          AbilityEnabled = "AbilityIconEnabled",
          ItemEnabled = "ItemIconEnabled",
        }

        enum DialogVar {
          Title = "title",
          Body = "body",
        }

        export class PopupTextEntry extends Component<Elements, never, never, Params> {
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
                $: {
                  oncancel: () => this.close(),
                },
                textEntry: {
                  oninputsubmit: () => this.submit(),
                },
                btnSubmit: {
                  onactivate: () => this.submit(),
                },
                btnCancel: {
                  onactivate: () => this.close(),
                },
              },
              params: {
                [Param.Channel]: { type: ParamType.String, default: "" },
                [Param.Title]: { type: ParamType.String, default: "" },
                [Param.Body]: { type: ParamType.String, default: "" },
                [Param.Image]: { type: ParamType.String, default: "" },
                [Param.EconItem]: { type: ParamType.Uint32, default: 0 },
                [Param.HeroId]: { type: ParamType.Uint32, default: 0 },
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

          get heroId(): HeroID | undefined {
            return this.params[Param.HeroId] as HeroID;
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
              this.hasHeroId() ||
              this.hasHero() ||
              this.hasAbility() ||
              this.hasItem()
            );
          }

          hasBody(): this is { body: string } {
            return (this.body?.length ?? 0) > 0;
          }

          hasImage(): this is { image: string } {
            return (this.image?.length ?? 0) > 0;
          }

          hasEconItem(): this is { econItem: number } {
            return (this.econItem ?? 0) > 0;
          }

          hasHeroId(): this is { heroId: HeroID } {
            return (this.heroId ?? 0) > 0;
          }

          hasHero(): this is { hero: string } {
            return (this.hero?.length ?? 0) > 0;
          }

          hasAbility(): this is { ability: string } {
            return (this.ability?.length ?? 0) > 0;
          }

          hasItem(): this is { item: string } {
            return (this.item?.length ?? 0) > 0;
          }

          render(): void {
            let iconClass: CssClass | null = null;

            this.panel.SetDialogVariable(DialogVar.Title, this.title ?? "");
            this.panel.SetDialogVariable(DialogVar.Body, this.body ?? "");

            if (this.hasImage()) {
              this.elements.image.SetImage(this.image);
              iconClass = CssClass.ImageEnabled;
            } else if (this.hasEconItem()) {
              this.elements.econItemImage.SetItemByDefinition(this.econItem);
              iconClass = CssClass.EconItemEnabled;
            } else if (this.hasHeroId()) {
              this.elements.heroImage.heroid = this.heroId;
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

          close(): void {
            this.closePopup(this.panel);
          }

          submit(): void {
            const {
              params: { [Param.Channel]: channel },
              elements: {
                textEntry: { text },
              },
            } = this;

            const payload = { channel, text };

            this.debug("Submit()", payload);
            this.sendClientSide(GameEvent.PopupTextEntrySubmit, payload);
            this.close();
          }
        }

        export const component = new PopupTextEntry();
      }
    }
  }
}

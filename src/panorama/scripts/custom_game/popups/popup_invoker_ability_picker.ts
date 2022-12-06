namespace invk {
  export namespace Components {
    export namespace Popups {
      export namespace PopupInvokerAbilityPicker {
        export interface Elements extends Component.Elements {
          abilities: Panel;
        }

        export type Inputs = never;
        export type Outputs = never;

        export interface Params extends Component.Params {
          channel: string;
        }

        const {
          CustomEvents: { Name: CustomEventName },
          Dota2: { Invoker },
          Panorama: { createAbilityImage },
          Util: { pascalCase },
          Vendor: { lodash: _ },
        } = GameUI.CustomUIConfig().invk;

        enum PanelID {
          AbilityImagePrefix = "PopupInvokerAbilityPicker",
        }

        enum CssClass {
          Ability = "PopupInvokerAbilityPickerAbility",
          AbilityHighlight = "Highlighted",
        }

        const INVALID_CHANNEL = "<invalid>";
        const INVALID_ABILITY = "<invalid>";

        const abilityImageID = (name: string): string =>
          `${PanelID.AbilityImagePrefix}${pascalCase(name)}`;

        export class PopupInvokerAbilityPicker extends Component.Component<
          Elements,
          Inputs,
          Outputs
        > {
          abilityPanels: Record<string, AbilityImage> = {};
          channel: string = INVALID_CHANNEL;
          selected: string = INVALID_ABILITY;

          constructor() {
            super({
              elements: {
                abilities: "PopupInvokerAbilityPickerAbilityList",
              },
            });

            this.debug("init");
          }

          // ----- Event handlers -----

          onLoad() {
            this.channel = this.panel.GetAttributeString("channel", INVALID_CHANNEL);

            this.debug("onLoad()", { channel: this.channel });
            this.render();
          }

          onImageActivate(imagePanel: AbilityImage) {
            this.debug("onImageActivate()", imagePanel.id);
            this.select(imagePanel);
          }

          // ----- Helpers -----

          select(imagePanel: AbilityImage) {
            const highlighted = this.elements.abilities.FindChildrenWithClassTraverse(
              CssClass.AbilityHighlight
            );

            _.each(highlighted, (panel) => panel.RemoveClass(CssClass.AbilityHighlight));

            imagePanel.AddClass(CssClass.AbilityHighlight);

            this.selected = imagePanel.abilityname;

            this.Submit();
          }

          render() {
            _.each(Invoker.SPELL_ABILITIES, (ability) =>
              this.createAbilityImage(this.elements.abilities, ability)
            );

            this.debug("render()");
          }

          createAbilityImage(parent: Panel, abilityName: string) {
            const abilityId = abilityImageID(abilityName);
            const panel = createAbilityImage(parent, abilityId, abilityName);

            panel.AddClass(CssClass.Ability);
            panel.SetPanelEvent("onactivate", () => this.onImageActivate(panel));

            this.abilityPanels[abilityName] = panel;
          }

          // ----- UI methods -----

          Close() {
            this.closePopup(this.panel);
          }

          Submit() {
            const { channel, selected: ability } = this;
            const payload = { channel, ability };

            this.debug("Submit()", payload);
            this.sendClientSide(CustomEventName.POPUP_ABILITY_PICKER_SUBMIT, payload);
            this.Close();
          }
        }

        export const component = new PopupInvokerAbilityPicker();
      }
    }
  }
}

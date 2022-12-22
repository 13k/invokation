// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace Popups {
      export namespace PopupInvokerAbilityPicker {
        export interface Elements extends Component.Elements {
          abilities: Panel;
          btnClose: Button;
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

        const { ParamType } = Component;

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
          Outputs,
          Params
        > {
          abilityPanels: Record<string, AbilityImage> = {};
          selected: string = INVALID_ABILITY;

          constructor() {
            super({
              elements: {
                abilities: "PopupInvokerAbilityPickerAbilityList",
                btnClose: "PopupInvokerAbilityPickerClose",
              },
              panelEvents: {
                btnClose: {
                  onactivate: () => this.Close(),
                },
              },
              params: {
                channel: { type: ParamType.String, default: INVALID_CHANNEL },
              },
            });

            this.setPanelEvent("oncancel", () => this.Close());
            this.debug("init");
          }

          // ----- Event handlers -----

          override onLoad(): void {
            this.debug("onLoad()", this.params);
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
            const {
              params: { channel },
              selected: ability,
            } = this;

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
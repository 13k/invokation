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
          Layout: { ID: LayoutID },
        } = GameUI.CustomUIConfig().invk;

        const { ParamType } = Component;

        const INVALID_CHANNEL = "<invalid>";
        const INVALID_ABILITY = "<invalid>";

        export class PopupInvokerAbilityPicker extends Component.Component<
          Elements,
          Inputs,
          Outputs,
          Params
        > {
          spellCard?: UI.InvokerSpellCard.InvokerSpellCard;
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

          onSelect(payload: UI.InvokerSpellCard.Outputs["OnSelect"]) {
            this.debug("onSelect()", payload);
            this.select(payload.ability);
          }

          // ----- Helpers -----

          select(ability: string) {
            this.selected = ability;
            this.Submit();
          }

          render() {
            this.spellCard = this.create(
              LayoutID.UIInvokerSpellCard,
              "spell-card",
              this.elements.abilities,
            );

            this.spellCard.Output("OnSelect", this.onSelect.bind(this));

            this.debug("render()");
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

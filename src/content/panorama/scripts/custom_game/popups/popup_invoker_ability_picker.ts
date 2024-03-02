// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace popups {
      export namespace invoker_ability_picker {
        const {
          custom_events: { GameEvent },
          layout: { LayoutID },
        } = GameUI.CustomUIConfig().invk;

        import invoker_spell_card = invk.components.ui.invoker_spell_card;

        import Component = invk.component.Component;
        import ParamType = invk.component.ParamType;

        export interface Elements extends component.Elements {
          abilities: Panel;
          btnClose: Button;
        }

        export interface Params extends component.Params {
          channel: string;
        }

        const INVALID_CHANNEL = "<invalid>";
        const INVALID_ABILITY = "<invalid>";

        export class PopupInvokerAbilityPicker extends Component<Elements, never, never, Params> {
          spellCard: invoker_spell_card.InvokerSpellCard | undefined;
          selected: string = INVALID_ABILITY;

          constructor() {
            super({
              elements: {
                abilities: "PopupInvokerAbilityPickerAbilityList",
                btnClose: "PopupInvokerAbilityPickerClose",
              },
              panelEvents: {
                $: {
                  oncancel: () => this.Close(),
                },
                btnClose: {
                  onactivate: () => this.Close(),
                },
              },
              params: {
                channel: { type: ParamType.String, default: INVALID_CHANNEL },
              },
            });

            this.debug("init");
          }

          // ----- Event handlers -----

          override onLoad(): void {
            this.debug("onLoad()", this.params);
            this.render();
          }

          onSelect(payload: invoker_spell_card.Outputs["OnSelect"]) {
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

            this.spellCard.registerOutput("OnSelect", this.onSelect.bind(this));

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
            this.sendClientSide(GameEvent.POPUP_ABILITY_PICKER_SUBMIT, payload);
            this.Close();
          }
        }

        export const component = new PopupInvokerAbilityPicker();
      }
    }
  }
}

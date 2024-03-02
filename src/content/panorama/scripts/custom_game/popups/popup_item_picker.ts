// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace popups {
      export namespace item_picker {
        const {
          layout,
          custom_events: { GameEvent },
        } = GameUI.CustomUIConfig().invk;

        import item_picker = invk.components.ui.item_picker;

        import Component = invk.component.Component;
        import ParamType = invk.component.ParamType;

        export interface Elements extends component.Elements {
          itemPickerContainer: Panel;
          btnClose: Button;
        }

        export interface Params extends component.Params {
          channel: string;
        }

        enum PanelID {
          ItemPicker = "PopupItemPickerUIItemPicker",
        }

        const INVALID_CHANNEL = "<invalid>";
        const INVALID_ITEM = "<invalid>";

        export class PopupItemPicker extends Component<Elements, never, never, Params> {
          selected: string = INVALID_ITEM;
          itemPicker: item_picker.ItemPicker | undefined;

          constructor() {
            super({
              elements: {
                itemPickerContainer: "PopupItemPickerUIItemPickerContainer",
                btnClose: "PopupItemPickerClose",
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

          onItemSelected(payload: item_picker.Outputs["OnSelect"]) {
            this.debug("onItemSelected()", payload);

            this.selected = payload.item;

            this.Submit();
          }

          // ----- Helpers -----

          render() {
            this.itemPicker = this.create(
              layout.LayoutID.UIItemPicker,
              PanelID.ItemPicker,
              this.elements.itemPickerContainer,
            );

            this.itemPicker.registerOutputs({
              OnSelect: this.onItemSelected.bind(this),
            });

            this.debug("render()");
          }

          // ----- UI methods -----

          Close() {
            this.closePopup(this.panel);
          }

          Submit() {
            const {
              params: { channel },
              selected: item,
            } = this;

            const payload = { channel, item };

            this.debug("Submit()", payload);
            this.sendClientSide(GameEvent.POPUP_ITEM_PICKER_SUBMIT, payload);
            this.Close();
          }
        }

        export const component = new PopupItemPicker();
      }
    }
  }
}

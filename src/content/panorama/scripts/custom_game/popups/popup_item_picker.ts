// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace Popups {
      export namespace PopupItemPicker {
        export interface Elements extends Component.Elements {
          itemPickerContainer: Panel;
          btnClose: Button;
        }

        export type Inputs = never;
        export type Outputs = never;

        export interface Params extends Component.Params {
          channel: string;
        }

        const {
          Layout,
          CustomEvents: { Name: CustomEventName },
        } = GameUI.CustomUIConfig().invk;

        const { ParamType } = Component;

        enum PanelID {
          ItemPicker = "PopupItemPickerUIItemPicker",
        }

        const INVALID_CHANNEL = "<invalid>";
        const INVALID_ITEM = "<invalid>";

        export class PopupItemPicker extends Component.Component<
          Elements,
          Inputs,
          Outputs,
          Params
        > {
          selected: string;
          itemPicker?: Components.UI.ItemPicker.ItemPicker;

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

            this.selected = INVALID_ITEM;

            this.debug("init");
          }

          // ----- Event handlers -----

          override onLoad(): void {
            this.debug("onLoad()", this.params);
            this.render();
          }

          onItemSelected(payload: Components.UI.ItemPicker.Outputs["OnSelect"]) {
            this.debug("onItemSelected()", payload);

            this.selected = payload.item;

            this.Submit();
          }

          // ----- Helpers -----

          render() {
            this.itemPicker = this.create(
              Layout.ID.UIItemPicker,
              PanelID.ItemPicker,
              this.elements.itemPickerContainer,
            );

            this.itemPicker.Outputs({
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
            this.sendClientSide(CustomEventName.POPUP_ITEM_PICKER_SUBMIT, payload);
            this.Close();
          }
        }

        export const component = new PopupItemPicker();
      }
    }
  }
}

namespace invk {
  export namespace Components {
    export namespace Popups {
      export namespace PopupItemPicker {
        export interface Elements extends Component.Elements {
          itemPickerContainer: Panel;
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

        enum PanelID {
          ItemPicker = "PopupItemPickerUIItemPicker",
        }

        const INVALID_CHANNEL = "<invalid>";
        const INVALID_ITEM = "<invalid>";

        export class PopupItemPicker extends Component.Component<Elements, Inputs, Outputs> {
          channel: string;
          selected: string;
          itemPicker?: Components.UI.ItemPicker.ItemPicker;

          constructor() {
            super({
              elements: {
                itemPickerContainer: "PopupItemPickerUIItemPickerContainer",
              },
            });

            this.channel = INVALID_CHANNEL;
            this.selected = INVALID_ITEM;

            this.debug("init");
          }

          // ----- Event handlers -----

          onLoad() {
            this.channel = this.panel.GetAttributeString("channel", INVALID_CHANNEL);

            this.debug("onLoad()", { channel: this.channel });
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
              this.elements.itemPickerContainer
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
            const { channel, selected: item } = this;
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

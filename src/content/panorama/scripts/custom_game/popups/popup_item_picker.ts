namespace invk {
  export namespace Components {
    export namespace Popups {
      export namespace ItemPicker {
        const {
          Layout: { LayoutId },
          CustomEvents: { GameEvent },
        } = GameUI.CustomUIConfig().invk;

        import Component = invk.Component.Component;
        import ParamType = invk.Component.ParamType;
        import UiItemPicker = invk.Components.Ui.ItemPicker;

        export interface Elements extends Component.Elements {
          itemPickerContainer: Panel;
          btnClose: Button;
        }

        export interface Params extends Component.Params {
          channel: string;
        }

        enum PanelId {
          ItemPicker = "PopupItemPickerUIItemPicker",
        }

        const INVALID_CHANNEL = "<invalid>";
        const INVALID_ITEM = "<invalid>";

        export class PopupItemPicker extends Component<Elements, never, never, Params> {
          selected: string = INVALID_ITEM;
          itemPicker: UiItemPicker.ItemPicker | undefined;

          constructor() {
            super({
              elements: {
                itemPickerContainer: "PopupItemPickerUIItemPickerContainer",
                btnClose: "PopupItemPickerClose",
              },
              panelEvents: {
                $: {
                  oncancel: () => this.close(),
                },
                btnClose: {
                  onactivate: () => this.close(),
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

          onItemSelected(payload: UiItemPicker.Outputs["onSelect"]): void {
            this.debug("onItemSelected()", payload);

            this.selected = payload.item;

            this.submit();
          }

          // ----- Helpers -----

          render(): void {
            this.itemPicker = this.create(
              LayoutId.UiItemPicker,
              PanelId.ItemPicker,
              this.elements.itemPickerContainer,
            );

            this.itemPicker.registerOutputs({
              onSelect: this.onItemSelected.bind(this),
            });

            this.debug("render()");
          }

          close(): void {
            this.closePopup(this.panel);
          }

          submit(): void {
            const {
              params: { channel },
              selected: item,
            } = this;

            const payload = { channel, item };

            this.debug("Submit()", payload);
            this.sendClientSide(GameEvent.PopupItemPickerSubmit, payload);
            this.close();
          }
        }

        export const component = new PopupItemPicker();
      }
    }
  }
}

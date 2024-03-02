namespace invk {
  export namespace Components {
    export namespace TopBar {
      const {
        Layout: { LayoutId },
      } = GameUI.CustomUIConfig().invk;

      import Component = invk.Component.Component;

      export interface Elements extends Component.Elements {
        btnShowGameInfo: Button;
      }

      enum PanelId {
        PopupGameInfo = "PopupGameInfo",
      }

      export class TopBar extends Component<Elements> {
        constructor() {
          super({
            elements: {
              btnShowGameInfo: "BtnShowGameInfo",
            },
            panelEvents: {
              btnShowGameInfo: { onactivate: () => this.onBtnShowGameInfo() },
            },
          });

          this.debug("init");
        }

        // ----- UI methods -----

        onBtnShowGameInfo(): void {
          this.debug("ShowGameInfo()");
          this.showPopup(this.panel, LayoutId.PopupGameInfo, PanelId.PopupGameInfo);
        }
      }

      export const component = new TopBar();
    }
  }
}

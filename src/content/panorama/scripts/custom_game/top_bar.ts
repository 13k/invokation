// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace TopBar {
      const {
        layout: { LayoutID },
      } = GameUI.CustomUIConfig().invk;

      import Component = invk.component.Component;

      export interface Elements extends component.Elements {
        btnShowGameInfo: Button;
      }

      enum PanelID {
        PopupGameInfo = "PopupGameInfo",
      }

      export class TopBar extends Component<Elements> {
        constructor() {
          super({
            elements: {
              btnShowGameInfo: "BtnShowGameInfo",
            },
            panelEvents: {
              btnShowGameInfo: { onactivate: () => this.ShowGameInfo() },
            },
          });

          this.debug("init");
        }

        // ----- UI methods -----

        ShowGameInfo(): void {
          this.debug("ShowGameInfo()");
          this.showPopup(this.panel, LayoutID.PopupGameInfo, PanelID.PopupGameInfo);
        }
      }

      export const component = new TopBar();
    }
  }
}

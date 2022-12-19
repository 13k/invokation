// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace TopBar {
      export interface Elements extends Component.Elements {
        btnShowGameInfo: Button;
      }

      export type Inputs = never;
      export type Outputs = never;
      export type Params = never;

      const { Layout } = GameUI.CustomUIConfig().invk;

      enum PanelID {
        PopupGameInfo = "PopupGameInfo",
      }

      export class TopBar extends Component.Component<Elements, Inputs, Outputs, Params> {
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
          this.showPopup(this.panel, Layout.ID.PopupGameInfo, PanelID.PopupGameInfo);
        }
      }

      export const component = new TopBar();
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace Popups {
      export namespace PopupGameInfo {
        export interface Elements extends Component.Elements {
          versionLabel: LabelPanel;
          btnClose: Button;
          btnOpenHomepage: Button;
          btnOpenChangelog: Button;
        }

        export type Inputs = never;
        export type Outputs = never;
        export type Params = never;

        const {
          Const: { META },
          Sequence: { ParallelSequence },
        } = GameUI.CustomUIConfig().invk;

        export class PopupGameInfo extends Component.Component<Elements, Inputs, Outputs, Params> {
          constructor() {
            super({
              elements: {
                versionLabel: "GameInfoVersionLabel",
                btnClose: "GameInfoClose",
                btnOpenHomepage: "GameInfoOpenHomepage",
                btnOpenChangelog: "GameInfoOpenChangelog",
              },
              panelEvents: {
                btnClose: {
                  onactivate: () => this.Close(),
                },
                btnOpenHomepage: {
                  onactivate: () => this.OpenHomepageURL(),
                },
                btnOpenChangelog: {
                  onactivate: () => this.OpenChangelogURL(),
                },
              },
            });

            this.setPanelEvent("oncancel", () => this.Close());
            this.debug("init");
          }

          // ----- Event handlers -----

          override onLoad(): void {
            this.debug("onLoad()");
            this.render();
          }

          // ----- Helpers -----

          openURL(url: string) {
            this.openExternalURL(this.panel, url);
          }

          // ----- Action runners -----

          render() {
            const seq = new ParallelSequence().SetAttribute(
              this.elements.versionLabel,
              "text",
              META.VERSION
            );

            this.debugFn(() => ["render()", { actions: seq.size() }]);

            seq.Run();
          }

          // ----- UI methods -----

          Close() {
            this.closePopup(this.panel);
          }

          OpenHomepageURL() {
            this.openURL(META.URL);
          }

          OpenChangelogURL() {
            this.openURL(META.CHANGELOG_URL);
          }
        }

        export const component = new PopupGameInfo();
      }
    }
  }
}

namespace invk {
  export namespace Components {
    export namespace Popups {
      export namespace GameInfo {
        const {
          Constants: { META },
        } = GameUI.CustomUIConfig().invk;

        import Component = invk.Component.Component;

        export interface Elements extends Component.Elements {
          versionLabel: LabelPanel;
          btnClose: Button;
          btnOpenHomepage: Button;
          btnOpenChangelog: Button;
        }

        export class PopupGameInfo extends Component<Elements> {
          constructor() {
            super({
              elements: {
                versionLabel: "GameInfoVersionLabel",
                btnClose: "GameInfoClose",
                btnOpenHomepage: "GameInfoOpenHomepage",
                btnOpenChangelog: "GameInfoOpenChangelog",
              },
              panelEvents: {
                $: {
                  oncancel: () => this.close(),
                },
                btnClose: {
                  onactivate: () => this.close(),
                },
                btnOpenHomepage: {
                  onactivate: () => this.openHomepageUrl(),
                },
                btnOpenChangelog: {
                  onactivate: () => this.openChangelogUrl(),
                },
              },
            });

            this.debug("init");
          }

          // ----- Event handlers -----

          override onLoad(): void {
            this.debug("onLoad()");
            this.render();
          }

          // ----- Helpers -----

          render(): void {
            this.elements.versionLabel.text = META.version;
          }

          close(): void {
            this.closePopup(this.panel);
          }

          openHomepageUrl(): void {
            this.openUrl(this.panel, META.url);
          }

          openChangelogUrl(): void {
            this.openUrl(this.panel, META.changelogUrl);
          }
        }

        export const component = new PopupGameInfo();
      }
    }
  }
}

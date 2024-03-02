// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace popups {
      export namespace game_info {
        const {
          constants: { META },
          sequence: { ParallelSequence },
        } = GameUI.CustomUIConfig().invk;

        import Component = invk.component.Component;

        export interface Elements extends component.Elements {
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
                  oncancel: () => this.Close(),
                },
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
              META.VERSION,
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

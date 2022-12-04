import type { Elements as CElements } from "../../lib/component";

export interface Elements extends CElements {
  versionLabel: LabelPanel;
}

export type Params = never;

const {
  Component,
  Const: { META },
  Sequence: { ParallelSequence },
} = GameUI.CustomUIConfig();

class PopupGameInfo extends Component<Elements> {
  constructor() {
    super({
      elements: {
        versionLabel: "GameInfoVersionLabel",
      },
    });

    this.render();
    this.debug("init");
  }

  // ----- Event handlers -----

  onLoad(this: this) {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new PopupGameInfo();

export type { PopupGameInfo };

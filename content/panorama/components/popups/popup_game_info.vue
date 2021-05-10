<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/popups/popup_game_info.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/popups/popups_shared.css" />
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/popups/popup_game_info.css" />
  </styles>

  <Popup class="root PopupPanel" popupbackground="dim" onload="popup.load()" oncancel="popup.close()">
    <Button class="CloseButton" onactivate="popup.close()" />

    <Panel class="contents">
      <Label class="PopupTitle" text="#invokation_game_info_title" hittest="false" />

      <DOTAScenePanel class="orbs-scene" map="custom_game/scenes/kid_invoker_orbs" camera="camera" particleonly="false" renderdeferred="true" deferredalpha="true" antialias="true" />

      <Label class="PopupDescription" text="#invokation_game_info_description" html="true" hittest="false" />

      <Panel class="separator" />

      <Panel class="PopupButtonRow">
        <Panel class="info-item">
          <Label id="version-label" class="info-text" />
        </Panel>

        <Button class="info-item link-button" onactivate="popup.openHomepageURL()">
          <Label class="info-text" text="#invokation_game_info_home_page" />
          <Panel class="button-arrow arrow-popout" />
        </Button>

        <Button class="info-item link-button" onactivate="popup.openChangelogURL()">
          <Label class="info-text" text="#invokation_game_info_changelog" />
          <Panel class="button-arrow arrow-popout" />
        </Button>
      </Panel>
    </Panel>
  </Popup>
</root>
</layout>

<script lang="ts">
import { META } from "../../scripts/lib/const/meta";
import { Inputs as BaseInputs, Outputs as BaseOutputs, Popup } from "../../scripts/lib/popup";
import { SerialSequence } from "../../scripts/lib/sequence";
import { UIEvents } from "../../scripts/lib/ui_events";

export type Inputs = BaseInputs;
export type Outputs = BaseOutputs;

interface Elements {
  version: LabelPanel;
}

export default class PopupGameInfo extends Popup<never> {
  #elements: Elements;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      version: "version-label",
    });
  }

  render(): void {
    const seq = new SerialSequence().SetText(this.#elements.version, META.version);

    this.debugFn(() => ["render()", { actions: seq.length }]);

    seq.run();
  }

  openHomepageURL(): void {
    UIEvents.openExternalURL(META.url);
  }

  openChangelogURL(): void {
    UIEvents.openExternalURL(META.changelogUrl);
  }
}

global.popup = new PopupGameInfo();
</script>

<style lang="scss">
@use "../../styles/variables";
@use "../../styles/ui";

.root {
  flow-children: none;
  width: 1300px;
  align: center center;
}

.CloseButton {
  width: 30px;
  height: 30px;
  margin-top: -16px;
  margin-right: -48px;
  align: right top;
  wash-color: #ddd;
}

.contents {
  width: 100%;
  padding: 32px;
  overflow: squish scroll;
  flow-children: down;
}

.PopupTitle {
  color: #fff;
  font-weight: semi-bold;
  font-family: variables.$font-title;
}

.PopupDescription {
  width: 600px;
  horizontal-align: center;
  text-align: center;
}

.orbs-scene {
  width: 768px;
  height: 256px;
  horizontal-align: center;
}

.separator {
  width: 100%;
  margin-top: 30px;
  margin-bottom: 30px;
  border-top: 1px solid #444;
}

.PopupButtonRow {
  margin-top: 0;
}

.info-item {
  margin-right: 16px;
  vertical-align: center;
}

.info-text {
  height: 18px;
  color: variables.$color-text-link;
  font-weight: normal;
  font-size: 18px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.link-button {
  flow-children: right;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 2px;
}

.link-button:hover {
  background-color: #222;
  border-top: 1px solid #333;
  border-right: 1px solid #000;
  border-bottom: 1px solid #000;
  border-left: 1px solid #333;
}

.link-button:active {
  background-color: #444;
  border-top: 1px solid #666;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
  border-left: 1px solid #666;
}

.link-button .arrow-popout {
  width: 16px;
  height: 16px;
  margin: 2px 0 0 2px;
  wash-color: variables.$color-text-link;
  background-size: cover;
}

.link-button:hover .arrow-popout {
  wash-color: #fff;
}
</style>

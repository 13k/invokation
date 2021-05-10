<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/popups/popup_debug.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/popups/popups_shared.css" />
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/popups/popup_debug.css" />
  </styles>

  <Popup class="root PopupPanel" popupbackground="dim" onload="popup.load()" oncancel="popup.close()">
    <Panel class="header" hittest="false">
      <Label class="PopupTitle" text="Debug" hittest="false" />
    </Panel>

    <Panel class="separator" hittest="false" />

    <Panel class="body" hittest="false">
    </Panel>

    <Panel class="separator" hittest="false" />

    <Panel class="PopupButtonRow" hittest="false">
      <Button class="PopupButton Purple" onactivate="popup.Debug()">
        <Label text="Debug" />
      </Button>

      <Button class="PopupButton" onactivate="popup.close()">
        <Label text="#DOTA_Cancel" />
      </Button>
    </Panel>
  </Popup>
</root>
</layout>

<script lang="ts">
import { ComponentLayout } from "../../scripts/lib/const/component";
import { Inputs as BaseInputs, Outputs as BaseOutputs, Popup } from "../../scripts/lib/popup";
import { UIEvents } from "../../scripts/lib/ui_events";

export type Inputs = BaseInputs;
export type Outputs = BaseOutputs;

export default class PopupDebug extends Popup<never> {
  render(): void {
    return;
  }

  Debug(): void {
    this.debug("------------------------------ Debug() ------------------------------");

    const params = {
      channel: "popup-text-entry-debug-channel",
      title: "Shitty Wizard",
      description: "A profitable engagement!",

      // image: "s2r://panorama/images/dpc/favorite_star_psd.vtex",

      // econItem: 13562,
      // econItemStyle: 0,

      hero: "npc_dota_hero_invoker",
      // heroID: 74,
      heroStyle: "portrait",

      // ability: "invoker_sun_strike",

      // item: "item_blink",
    };

    UIEvents.showPopup("popup-text-entry-debug", ComponentLayout.PopupTextEntry, params);

    this.debug("---------------------------------------------------------------------");
  }
}

global.popup = new PopupDebug();
</script>

<style lang="scss">
.header {
  width: 100%;
}

.body {
  flow-children: down;
  width: 640px;
  height: 480px;
}

.separator {
  width: 100%;
  margin-top: 30px;
  margin-bottom: 30px;
  border-top: 1px solid #444;
}
</style>

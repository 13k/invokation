<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/top_bar.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/top_bar.css" />
  </styles>

  <Panel class="root">
    <Panel class="topbar" hittest="false" require-composition-layer="true" always-cache-composition-layer="true">
      <!-- <Button class="topbar-button button-dashboard" onactivate="DOTAHUDShowDashboard()" onmouseover="UIShowTextTooltip(DOTA_HUD_BackToDashboard)" onmouseout="UIHideTextTooltip()" /> -->
      <Button class="topbar-button button-settings" onactivate="DOTAShowSettingsPopup()" onmouseover="UIShowTextTooltip(DOTA_HUD_Settings)" onmouseout="UIHideTextTooltip()" />
      <Button class="topbar-button button-info" onactivate="topbar.ShowGameInfo()" onmouseover="UIShowTextTooltip(DOTA_Custom_Game_Info)" onmouseout="UIHideTextTooltip()" />
      <Button class="topbar-button button-hamburger" onactivate="topbar.TogglePicker()" onmouseover="UIShowTextTooltip(invokation_picker_title)" onmouseout="UIHideTextTooltip()" />
      <Button class="topbar-button button-bug" onactivate="topbar.ShowDebug()" onmouseover="UIShowTextTooltip('Debug')" onmouseout="UIHideTextTooltip()" />
    </Panel>
  </Panel>
</root>
</layout>

<script lang="ts">
import { Component } from "../scripts/lib/component";
import { ComponentLayout } from "../scripts/lib/const/component";
import { CustomEvent } from "../scripts/lib/const/events";
import { CustomEvents } from "../scripts/lib/custom_events";
import { UIEvents } from "../scripts/lib/ui_events";

export type Inputs = never;
export type Outputs = never;

const POPUP_GAME_INFO_ID = "popup-game-info";
const POPUP_DEBUG_ID = "popup-debug";

export default class TopBar extends Component {
  ShowGameInfo(): void {
    this.debug("ShowGameInfo()");

    UIEvents.showPopup(POPUP_GAME_INFO_ID, ComponentLayout.PopupGameInfo);
  }

  TogglePicker(): void {
    this.debug("TogglePicker()");

    CustomEvents.sendClientSide(CustomEvent.PICKER_TOGGLE);
  }

  ShowDebug(): void {
    this.debug("ShowDebug()");

    UIEvents.showPopup(POPUP_DEBUG_ID, ComponentLayout.PopupDebug);
  }
}

global.topbar = new TopBar();
</script>

<style lang="scss">
@use "../styles/variables";
@use "../styles/ui";

.root {
  width: 100%;
  height: 42px;
}

.topbar {
  flow-children: right;
  margin-top: 13px;
  margin-left: 50px;
}

.topbar .topbar-button {
  width: 30px;
  height: 30px;
  margin: 0 8px;
  vertical-align: middle;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
  opacity: 0.5;
  transition-duration: 0.2s;
  transition-property: opacity;
  horizontal-align: center;
  tooltip-position: bottom;
  wash-color: #cdf;
}

.topbar-button:hover {
  opacity: 1;
}

.topbar-button:active {
  opacity: 1;
}

.button-settings {
  margin-top: 2px;
  background-size: 27px;
}

.button-hamburger {
  wash-color: color_text_quas;
  background-size: 26px;
}

.button-hamburger:hover {
  wash-color: color_text_wex;
}

.button-hamburger:active {
  wash-color: color_text_exort;
}

.picker-active .button-hamburger {
  wash-color: color_text_exort;
}

.button-bug {
  visibility: collapse;
}

.development .button-bug {
  visibility: visible;
}
</style>

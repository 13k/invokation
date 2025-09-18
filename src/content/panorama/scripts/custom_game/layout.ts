// entry-points

import type { CustomLoadingScreen } from "./custom_loading_screen";
import type { CustomUiManifest } from "./custom_ui_manifest";

// custom game

import type { Challenge } from "./challenge";
import type { ChallengeComboStep } from "./challenge/combo_step";
import type { CombatLog } from "./combat_log";
import type { ComboScore } from "./combo_score";
import type { Freestyle } from "./freestyle";
import type { Picker } from "./picker";
import type { PickerCombo } from "./picker/combo";
import type { TopBar } from "./top_bar";
import type { Viewer } from "./viewer";
import type { ViewerComboStep } from "./viewer/combo_step";
import type { ViewerProperties } from "./viewer/properties";

// ui

import type { InvokerSpellCard } from "./ui/invoker_spell_card";
import type { ItemPicker } from "./ui/item_picker";
import type { TagSelect } from "./ui/tag_select";
import type { TalentsDisplay } from "./ui/talents_display";

// popups

import type { PopupGameInfo } from "./popups/game_info";
import type { PopupInvokerAbilityPicker } from "./popups/invoker_ability_picker";
import type { PopupItemPicker } from "./popups/item_picker";
import type { PopupTextEntry } from "./popups/text_entry";

// tooltips

import type { TooltipStatBranch } from "./tooltips/stat_branch";

// ---

export enum LayoutId {
  // entry-points
  CustomLoadingScreen = "custom_loading_screen",
  CustomUiManifest = "custom_ui_manifest",
  // custom game
  Challenge = "challenge",
  ChallengeComboStep = "challenge/combo_step",
  CombatLog = "combat_log",
  ComboScore = "combo_score",
  Freestyle = "freestyle",
  Picker = "picker",
  PickerCombo = "picker/combo",
  TopBar = "top_bar",
  Viewer = "viewer",
  ViewerComboStep = "viewer/combo_step",
  ViewerProperties = "viewer/properties",
  // ui
  UiInvokerSpellCard = "ui/invoker_spell_card",
  UiItemPicker = "ui/item_picker",
  UiTagSelect = "ui/tag_select",
  UiTalentsDisplay = "ui/talents_display",
  // popups
  PopupGameInfo = "popups/game_info",
  PopupInvokerAbilityPicker = "popups/invoker_ability_picker",
  PopupItemPicker = "popups/item_picker",
  PopupTextEntry = "popups/text_entry",
  // tooltips
  TooltipStatBranch = "tooltips/stat_branch",
}

export interface Components {
  // entry-points
  [LayoutId.CustomLoadingScreen]: CustomLoadingScreen;
  [LayoutId.CustomUiManifest]: CustomUiManifest;
  // custom game
  [LayoutId.Challenge]: Challenge;
  [LayoutId.ChallengeComboStep]: ChallengeComboStep;
  [LayoutId.CombatLog]: CombatLog;
  [LayoutId.ComboScore]: ComboScore;
  [LayoutId.Freestyle]: Freestyle;
  [LayoutId.Picker]: Picker;
  [LayoutId.PickerCombo]: PickerCombo;
  [LayoutId.TopBar]: TopBar;
  [LayoutId.Viewer]: Viewer;
  [LayoutId.ViewerComboStep]: ViewerComboStep;
  [LayoutId.ViewerProperties]: ViewerProperties;
  // ui
  [LayoutId.UiInvokerSpellCard]: InvokerSpellCard;
  [LayoutId.UiItemPicker]: ItemPicker;
  [LayoutId.UiTagSelect]: TagSelect;
  [LayoutId.UiTalentsDisplay]: TalentsDisplay;
  // popups
  [LayoutId.PopupGameInfo]: PopupGameInfo;
  [LayoutId.PopupInvokerAbilityPicker]: PopupInvokerAbilityPicker;
  [LayoutId.PopupItemPicker]: PopupItemPicker;
  [LayoutId.PopupTextEntry]: PopupTextEntry;
  // tooltips
  [LayoutId.TooltipStatBranch]: TooltipStatBranch;
}

export type Path<K extends LayoutId> = `file://{resources}/layout/custom_game/${K}.xml`;

export function path<K extends LayoutId>(id: K): Path<K> {
  return `file://{resources}/layout/custom_game/${id}.xml`;
}

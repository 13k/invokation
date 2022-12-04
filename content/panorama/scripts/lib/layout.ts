import type * as Challenge from "../custom_game/challenge";
import type * as ChallengeComboStep from "../custom_game/challenge_combo_step";
import type * as CombatLog from "../custom_game/combat_log";
import type * as ComboScore from "../custom_game/combo_score";
import type * as CustomLoadingScreen from "../custom_game/custom_loading_screen";
import type * as CustomUIManifest from "../custom_game/custom_ui_manifest";
import type * as Freestyle from "../custom_game/freestyle";
import type * as Picker from "../custom_game/picker";
import type * as PickerCombo from "../custom_game/picker_combo";
import type * as PopupGameInfo from "../custom_game/popups/popup_game_info";
import type * as PopupInvokerAbilityPicker from "../custom_game/popups/popup_invoker_ability_picker";
import type * as PopupItemPicker from "../custom_game/popups/popup_item_picker";
import type * as PopupTextEntry from "../custom_game/popups/popup_text_entry";
import type * as TooltipStatBranch from "../custom_game/tooltips/tooltip_stat_branch";
import type * as TopBar from "../custom_game/top_bar";
import type * as UIItemPicker from "../custom_game/ui/item_picker";
import type * as UITagSelect from "../custom_game/ui/tag_select";
import type * as UITalentsDisplay from "../custom_game/ui/talents_display";
import type * as Viewer from "../custom_game/viewer";
import type * as ViewerComboStep from "../custom_game/viewer_combo_step";
import type * as ViewerProperties from "../custom_game/viewer_properties";

enum ID {
  Challenge = "challenge",
  ChallengeComboStep = "challenge_combo_step",
  CombatLog = "combat_log",
  ComboScore = "combo_score",
  CustomLoadingScreen = "custom_loading_screen",
  CustomUIManifest = "custom_ui_manifest",
  Freestyle = "freestyle",
  Picker = "picker",
  PickerCombo = "picker_combo",
  TopBar = "top_bar",
  Viewer = "viewer",
  ViewerComboStep = "viewer_combo_step",
  ViewerProperties = "viewer_properties",
  // UI
  UIItemPicker = "ui/item_picker",
  UITagSelect = "ui/tag_select",
  UITalentsDisplay = "ui/talents_display",
  // Popups
  PopupGameInfo = "popups/popup_game_info",
  PopupInvokerAbilityPicker = "popups/popup_invoker_ability_picker",
  PopupItemPicker = "popups/popup_item_picker",
  PopupTextEntry = "popups/popup_text_entry",
  // Tooltips
  TooltipStatBranch = "tooltips/tooltip_stat_branch",
}

export interface Components {
  [ID.Challenge]: Challenge.Challenge;
  [ID.ChallengeComboStep]: ChallengeComboStep.ChallengeComboStep;
  [ID.CombatLog]: CombatLog.CombatLog;
  [ID.ComboScore]: ComboScore.ComboScore;
  [ID.CustomLoadingScreen]: CustomLoadingScreen.CustomLoadingScreen;
  [ID.CustomUIManifest]: CustomUIManifest.CustomUIManifest;
  [ID.Freestyle]: Freestyle.Freestyle;
  [ID.Picker]: Picker.Picker;
  [ID.PickerCombo]: PickerCombo.PickerCombo;
  [ID.TopBar]: TopBar.TopBar;
  [ID.Viewer]: Viewer.Viewer;
  [ID.ViewerComboStep]: ViewerComboStep.ViewerComboStep;
  [ID.ViewerProperties]: ViewerProperties.ViewerProperties;
  // UI
  [ID.UIItemPicker]: UIItemPicker.ItemPicker;
  [ID.UITagSelect]: UITagSelect.TagSelect;
  [ID.UITalentsDisplay]: UITalentsDisplay.TalentsDisplay;
  // Popups
  [ID.PopupGameInfo]: PopupGameInfo.PopupGameInfo;
  [ID.PopupInvokerAbilityPicker]: PopupInvokerAbilityPicker.PopupInvokerAbilityPicker;
  [ID.PopupItemPicker]: PopupItemPicker.PopupItemPicker;
  [ID.PopupTextEntry]: PopupTextEntry.PopupTextEntry;
  // Tooltips
  [ID.TooltipStatBranch]: TooltipStatBranch.TooltipStatBranch;
}

export interface PopupParams {
  [ID.PopupGameInfo]: PopupGameInfo.Params;
  [ID.PopupInvokerAbilityPicker]: PopupInvokerAbilityPicker.Params;
  [ID.PopupItemPicker]: PopupItemPicker.Params;
  [ID.PopupTextEntry]: PopupTextEntry.Params;
}

export interface TooltipParams {
  [ID.TooltipStatBranch]: TooltipStatBranch.Params;
}

export type Path<K extends ID> = `file://{resources}/layout/custom_game/${K}.xml`;

function Path(id: ID): Path<typeof id> {
  return `file://{resources}/layout/custom_game/${id}.xml`;
}

const module = {
  ID,
  Path,
};

export type Layout = typeof module;
export type { ID };

CustomUIConfig.Layout = module;

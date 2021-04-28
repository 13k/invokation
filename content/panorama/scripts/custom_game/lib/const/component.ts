import type { Challenge } from "../../challenge";
import type { ChallengeComboStep } from "../../challenge_combo_step";
import type { CombatLog } from "../../combat_log";
import type { ComboScore } from "../../combo_score";
import type { Freestyle } from "../../freestyle";
import type { Picker } from "../../picker";
import type { PickerCombos } from "../../picker_combos";
import type { PickerCombosItem } from "../../picker_combos_item";
import type { PopupDebug } from "../../popups/popup_debug";
import type { PopupGameInfo } from "../../popups/popup_game_info";
import type { PopupInvokerAbilityPicker } from "../../popups/popup_invoker_ability_picker";
import type { PopupItemPicker } from "../../popups/popup_item_picker";
import type { PopupTextEntry } from "../../popups/popup_text_entry";
import type { TooltipStatBranch } from "../../tooltips/tooltip_stat_branch";
import type { TopBar } from "../../top_bar";
import type { UIItemPicker } from "../../ui/item_picker";
import type { UITagSelect } from "../../ui/tag_select";
import type { UITalentsDisplay } from "../../ui/talents_display";
import type { Viewer } from "../../viewer";
import type { ViewerComboStep } from "../../viewer_combo_step";
import type { ViewerProperties } from "../../viewer_properties";

export interface Components {
  [ComponentLayout.Challenge]: Challenge;
  [ComponentLayout.ChallengeComboStep]: ChallengeComboStep;
  [ComponentLayout.ComboScore]: ComboScore;
  [ComponentLayout.CombatLog]: CombatLog;
  [ComponentLayout.Freestyle]: Freestyle;
  [ComponentLayout.Picker]: Picker;
  [ComponentLayout.PickerCombos]: PickerCombos;
  [ComponentLayout.PickerCombosItem]: PickerCombosItem;
  [ComponentLayout.TopBar]: TopBar;
  [ComponentLayout.Viewer]: Viewer;
  [ComponentLayout.ViewerComboStep]: ViewerComboStep;
  [ComponentLayout.ViewerProperties]: ViewerProperties;
  [ComponentLayout.PopupGameInfo]: PopupGameInfo;
  [ComponentLayout.PopupInvokerAbilityPicker]: PopupInvokerAbilityPicker;
  [ComponentLayout.PopupItemPicker]: PopupItemPicker;
  [ComponentLayout.PopupTextEntry]: PopupTextEntry;
  [ComponentLayout.PopupDebug]: PopupDebug;
  [ComponentLayout.TooltipStatBranch]: TooltipStatBranch;
  [ComponentLayout.UIItemPicker]: UIItemPicker;
  [ComponentLayout.UITagSelect]: UITagSelect;
  [ComponentLayout.UITalentsDisplay]: UITalentsDisplay;
}

export enum ComponentLayout {
  Challenge = "challenge.xml",
  ChallengeComboStep = "challenge_combo_step.xml",
  ComboScore = "combo_score.xml",
  CombatLog = "combat_log.xml",
  Freestyle = "freestyle.xml",
  Picker = "picker.xml",
  PickerCombos = "picker_combos.xml",
  PickerCombosItem = "picker_combos_item.xml",
  TopBar = "top_bar.xml",
  Viewer = "viewer.xml",
  ViewerComboStep = "viewer_combo_step.xml",
  ViewerProperties = "viewer_properties.xml",
  PopupGameInfo = "popups/popup_game_info.xml",
  PopupInvokerAbilityPicker = "popups/popup_invoker_ability_picker.xml",
  PopupItemPicker = "popups/popup_item_picker.xml",
  PopupTextEntry = "popups/popup_text_entry.xml",
  PopupDebug = "popups/popup_debug.xml",
  TooltipStatBranch = "tooltips/tooltip_stat_branch.xml",
  UIItemPicker = "ui/item_picker.xml",
  UITagSelect = "ui/tag_select.xml",
  UITalentsDisplay = "ui/talents_display.xml",
}

export const ABSTRACT_COMPONENTS = {
  COMBO_STEP: {
    inputs: {
      SET_STEP: "SetStep",
    },
  },
} as const;

export const COMPONENTS = {
  CHALLENGE: {
    layout: ComponentLayout.Challenge,
  },
  CHALLENGE_COMBO_STEP: {
    layout: ComponentLayout.ChallengeComboStep,
    inputs: {
      ...ABSTRACT_COMPONENTS.COMBO_STEP.inputs,
      BUMP: "StepBump",
      SET_ACTIVE: "SetStepActive",
      UNSET_ACTIVE: "UnsetStepActive",
      SET_ERROR: "SetStepError",
      UNSET_ERROR: "UnsetStepError",
    },
  },
  COMBAT_LOG: {
    layout: ComponentLayout.CombatLog,
  },
  COMBO_SCORE: {
    layout: ComponentLayout.ComboScore,
    inputs: {
      HIDE: "Hide",
      UPDATE_COUNTER: "UpdateCounter",
      UPDATE_SUMMARY: "UpdateSummary",
    },
  },
  // COMBO_STEP,
  FREESTYLE: {
    layout: ComponentLayout.Freestyle,
  },
  PICKER: {
    layout: ComponentLayout.Picker,
  },
  PICKER_COMBOS: {
    layout: ComponentLayout.PickerCombos,
    inputs: {
      SET_COMBOS: "SetCombos",
      SET_FINISHED: "SetFinished",
    },
    outputs: {
      ON_SELECT: "OnSelect",
    },
  },
  PICKER_COMBOS_ITEM: {
    layout: ComponentLayout.PickerCombosItem,
    inputs: {
      SET_COMBO: "SetCombo",
      SET_SELECTED: "SetSelected",
      UNSET_SELECTED: "UnsetSelected",
      SET_FINISHED: "SetFinished",
      UNSET_FINISHED: "UnsetFinished",
    },
    outputs: {
      ON_ACTIVATE: "OnActivate",
    },
  },
  TOP_BAR: {
    layout: ComponentLayout.TopBar,
  },
  VIEWER: {
    layout: ComponentLayout.Viewer,
  },
  VIEWER_COMBO_STEP: {
    layout: ComponentLayout.ViewerComboStep,
    inputs: { ...ABSTRACT_COMPONENTS.COMBO_STEP.inputs },
  },
  VIEWER_PROPERTIES: {
    layout: ComponentLayout.ViewerProperties,
    inputs: {
      SET_COMBO: "SetCombo",
    },
  },
  POPUP_GAME_INFO: {
    layout: ComponentLayout.PopupGameInfo,
  },
  POPUP_INVOKER_ABILITY_PICKER: {
    layout: ComponentLayout.PopupInvokerAbilityPicker,
  },
  POPUP_ITEM_PICKER: {
    layout: ComponentLayout.PopupItemPicker,
  },
  POPUP_TEXT_ENTRY: {
    layout: ComponentLayout.PopupTextEntry,
  },
  POPUP_DEBUG: {
    layout: ComponentLayout.PopupDebug,
  },
  TOOLTIP_STAT_BRANCH: {
    layout: ComponentLayout.TooltipStatBranch,
  },
  UI_ITEM_PICKER: {
    layout: ComponentLayout.UIItemPicker,
    outputs: {
      ON_SELECT: "OnSelect",
    },
  },
  UI_TAG_SELECT: {
    layout: ComponentLayout.UITagSelect,
    inputs: {
      SET_OPTIONS: "SetOptions",
      CLEAR: "Clear",
    },
    outputs: {
      ON_CHANGE: "OnChange",
    },
  },
  UI_TALENTS_DISPLAY: {
    layout: ComponentLayout.UITalentsDisplay,
    inputs: {
      RESET: "Reset",
      SELECT: "Select",
    },
  },
} as const;

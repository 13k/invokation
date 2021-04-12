import type { Challenge } from "../../challenge";
import type { ChallengeComboStep } from "../../challenge_combo_step";

export interface Components {
  "challenge.xml": Challenge;
  "challenge_combo_step.xml": ChallengeComboStep;
}

const COMBO_STEP = {
  inputs: {
    SET_STEP: "SetStep",
  },
};

export const COMPONENTS = {
  CHALLENGE: {
    layout: "challenge.xml",
    COMBO_STEP: {
      layout: "challenge_combo_step.xml",
      inputs: {
        ...COMBO_STEP.inputs,
        BUMP: "StepBump",
        SET_ACTIVE: "SetStepActive",
        UNSET_ACTIVE: "UnsetStepActive",
        SET_ERROR: "SetStepError",
        UNSET_ERROR: "UnsetStepError",
      },
    },
  },
  COMBAT_LOG: {
    layout: "combat_log.xml",
  },
  COMBO_SCORE: {
    layout: "combo_score.xml",
    inputs: {
      HIDE: "Hide",
      UPDATE_COUNTER: "UpdateCounter",
      UPDATE_SUMMARY: "UpdateSummary",
    },
  },
  COMBO_STEP,
  FREESTYLE: {
    layout: "freestyle.xml",
  },
  PICKER: {
    layout: "picker.xml",
    COMBOS: {
      layout: "picker_combos.xml",
      inputs: {
        SET_COMBOS: "SetCombos",
        SET_FINISHED: "SetFinished",
      },
      outputs: {
        ON_SELECT: "OnSelect",
      },
      COMBO_ITEM: {
        layout: "picker_combos_item.xml",
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
    },
  },
  TOP_BAR: {
    layout: "top_bar.xml",
  },
  VIEWER: {
    layout: "viewer.xml",
    COMBO_STEP: {
      layout: "viewer_combo_step.xml",
      inputs: { ...COMBO_STEP.inputs },
    },
    PROPERTIES: {
      layout: "viewer_properties.xml",
      inputs: {
        SET_COMBO: "SetCombo",
      },
    },
  },
  POPUPS: {
    GAME_INFO: {
      layout: "popups/popup_game_info.xml",
    },
    INVOKER_ABILITY_PICKER: {
      layout: "popups/popup_invoker_ability_picker.xml",
    },
    ITEM_PICKER: {
      layout: "popups/popup_item_picker.xml",
    },
    TEXT_ENTRY: {
      layout: "popups/popup_text_entry.xml",
    },
    DEBUG: {
      layout: "popups/popup_debug.xml",
    },
  },
  TOOLTIPS: {
    STAT_BRANCH: {
      layout: "tooltips/tooltip_stat_branch.xml",
    },
  },
  UI: {
    ITEM_PICKER: {
      layout: "ui/item_picker.xml",
      outputs: {
        ON_SELECT: "OnSelect",
      },
    },
    TAG_SELECT: {
      layout: "ui/tag_select.xml",
      inputs: {
        SET_OPTIONS: "SetOptions",
        CLEAR: "Clear",
      },
      outputs: {
        ON_CHANGE: "OnChange",
      },
    },
    TALENTS_DISPLAY: {
      layout: "ui/talents_display.xml",
      inputs: {
        RESET: "Reset",
        SELECT: "Select",
      },
    },
  },
};

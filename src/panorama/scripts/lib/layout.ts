namespace invk {
  export namespace Layout {
    export enum ID {
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

    export type Path<K extends ID> = `file://{resources}/layout/custom_game/${K}.xml`;

    export function path<K extends ID>(id: K): Path<K> {
      return `file://{resources}/layout/custom_game/${id}.xml`;
    }
  }
}

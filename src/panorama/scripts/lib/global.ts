GameUI.CustomUIConfig().invk = invk;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CustomUIConfig {
  invk: typeof invk;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CustomNetTableDeclarations {
  [invk.CustomNetTables.Name.Invokation]: invk.CustomNetTables.Invokation.Table;
  [invk.CustomNetTables.Name.Hero]: invk.CustomNetTables.Hero.Table;
  [invk.CustomNetTables.Name.Abilities]: invk.CustomNetTables.Abilities.Table;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CustomGameEventDeclarations {
  [invk.CustomEvents.Name.COMBOS_RELOAD]: invk.CustomEvents.CombosReload;
  [invk.CustomEvents.Name.COMBO_START]: invk.CustomEvents.ComboStart;
  [invk.CustomEvents.Name.COMBO_STARTED]: invk.CustomEvents.ComboStarted;
  [invk.CustomEvents.Name.COMBO_STOP]: invk.CustomEvents.ComboStop;
  [invk.CustomEvents.Name.COMBO_STOPPED]: invk.CustomEvents.ComboStopped;
  [invk.CustomEvents.Name.COMBO_IN_PROGRESS]: invk.CustomEvents.ComboInProgress;
  [invk.CustomEvents.Name.COMBO_PROGRESS]: invk.CustomEvents.ComboProgress;
  [invk.CustomEvents.Name.COMBO_STEP_ERROR]: invk.CustomEvents.ComboStepError;
  [invk.CustomEvents.Name.COMBO_PRE_FINISH]: invk.CustomEvents.ComboPreFinish;
  [invk.CustomEvents.Name.COMBO_FINISHED]: invk.CustomEvents.ComboFinished;
  [invk.CustomEvents.Name.COMBO_RESTART]: invk.CustomEvents.ComboRestart;
  [invk.CustomEvents.Name.FREESTYLE_HERO_LEVEL_UP]: invk.CustomEvents.FreestyleHeroLevelUp;
  [invk.CustomEvents.Name.COMBAT_LOG_ABILITY_USED]: invk.CustomEvents.CombatLogAbilityUsed;
  [invk.CustomEvents.Name.COMBAT_LOG_CLEAR]: invk.CustomEvents.CombatLogClear;
  [invk.CustomEvents.Name.COMBAT_LOG_CAPTURE_START]: invk.CustomEvents.CombatLogCaptureStart;
  [invk.CustomEvents.Name.COMBAT_LOG_CAPTURE_STOP]: invk.CustomEvents.CombatLogCaptureStop;
  [invk.CustomEvents.Name.ITEM_PICKER_QUERY]: invk.CustomEvents.ItemPickerQuery;
  [invk.CustomEvents.Name.ITEM_PICKER_QUERY_RESPONSE]: invk.CustomEvents.ItemPickerQueryResponse;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GameEventDeclarations {
  [invk.CustomEvents.Name.VIEWER_RENDER]: invk.CustomEvents.ViewerRender;
  [invk.CustomEvents.Name.POPUP_ABILITY_PICKER_SUBMIT]: invk.CustomEvents.PopupAbilityPickerSubmit;
  [invk.CustomEvents.Name.POPUP_ITEM_PICKER_SUBMIT]: invk.CustomEvents.PopupItemPickerSubmit;
  [invk.CustomEvents.Name.POPUP_TEXT_ENTRY_SUBMIT]: invk.CustomEvents.PopupTextEntrySubmit;
}

declare namespace invk.CustomEvents {
  enum Name {
    // combo picker
    PICKER_TOGGLE = "invokation_picker_toggle",
    // combo viewer
    VIEWER_RENDER = "invokation_viewer_render",
    // combos
    COMBOS_RELOAD = "invokation_combos_reload",
    COMBO_START = "invokation_combo_start",
    COMBO_STARTED = "invokation_combo_started",
    COMBO_STOP = "invokation_combo_stop",
    COMBO_STOPPED = "invokation_combo_stopped",
    COMBO_IN_PROGRESS = "invokation_combo_in_progress",
    COMBO_PROGRESS = "invokation_combo_progress",
    COMBO_STEP_ERROR = "invokation_combo_step_error",
    COMBO_PRE_FINISH = "invokation_combo_pre_finish",
    COMBO_FINISHED = "invokation_combo_finished",
    COMBO_RESTART = "invokation_combo_restart",
    // freestyle
    FREESTYLE_HERO_LEVEL_UP = "invokation_freestyle_hero_level_up",
    // combat log
    COMBAT_LOG_ABILITY_USED = "invokation_combat_log_ability_used",
    COMBAT_LOG_CLEAR = "invokation_combat_log_clear",
    COMBAT_LOG_CAPTURE_START = "invokation_combat_log_capture_start",
    COMBAT_LOG_CAPTURE_STOP = "invokation_combat_log_capture_stop",
    // item picker
    ITEM_PICKER_QUERY = "invokation_item_picker_query",
    ITEM_PICKER_QUERY_RESPONSE = "invokation_item_picker_query_response",
    // popups
    POPUP_TEXT_ENTRY_SUBMIT = "invokation_popup_text_entry_submit",
    POPUP_ITEM_PICKER_SUBMIT = "invokation_popup_item_picker_submit",
    POPUP_ABILITY_PICKER_SUBMIT = "invokation_popup_ability_picker_submit",
  }

  type PickerToggleEvent = Record<string, never>;

  interface ViewerRenderEvent {
    id: invk.Combo.ID;
  }

  type CombosReloadEvent = Record<string, never>;

  interface ComboStartEvent {
    id: invk.Combo.ID;
  }

  type ComboStartedEvent = Record<string, never>;
  type ComboStopEvent = Record<string, never>;
  type ComboStoppedEvent = Record<string, never>;
  type ComboInProgressEvent = Record<string, never>;
  type ComboProgressEvent = Record<string, never>;
  type ComboStepErrorEvent = Record<string, never>;
  type ComboPreFinishEvent = Record<string, never>;
  type ComboFinishedEvent = Record<string, never>;
  type ComboRestartEvent = Record<string, never>;
  type FreestyleHeroLevelUpEvent = Record<string, never>;
  type CombatLogAbilityUsedEvent = Record<string, never>;
  type CombatLogClearEvent = Record<string, never>;
  type CombatLogCaptureStartEvent = Record<string, never>;
  type CombatLogCaptureStopEvent = Record<string, never>;
  type ItemPickerQueryEvent = Record<string, never>;
  type ItemPickerQueryResponseEvent = Record<string, never>;

  interface PopupTextEntrySubmitEvent {
    channel: string;
    text: string;
  }

  interface PopupItemPickerSubmitEvent {
    channel: string;
    item: string;
  }

  interface PopupAbilityPickerSubmitEvent {
    channel: string;
    ability: string;
  }
}

declare namespace invk.UIEvents {
  enum Name {
    // general
    OpenExternalBrowser = "ExternalBrowserGoToURL",
    PlaySound = "PlaySoundEffect",
    // ability tooltip
    HideAbilityTooltip = "DOTAHideAbilityTooltip",
    ShowAbilityTooltip = "DOTAShowAbilityTooltip",
    ShowAbilityTooltipEntityIndex = "DOTAShowAbilityTooltipForEntityIndex",
    ShowAbilityTooltipGuide = "DOTAShowAbilityTooltipForGuide",
    ShowAbilityTooltipHero = "DOTAShowAbilityTooltipForHero",
    ShowAbilityTooltipLevel = "DOTAShowAbilityTooltipForLevel",
    // text tooltip
    HideTextTooltip = "DOTAHideTextTooltip",
    ShowTextTooltip = "DOTAShowTextTooltip",
    // custom layout tooltip
    HideTooltip = "UIHideCustomLayoutTooltip",
    ShowTooltip = "UIShowCustomLayoutTooltip",
    ShowTooltipParams = "UIShowCustomLayoutParametersTooltip",
    // popup
    PopupButtonClicked = "UIPopupButtonClicked",
    ShowPopup = "UIShowCustomLayoutPopup",
    ShowPopupParams = "UIShowCustomLayoutPopupParameters",
    // scene panel
    ScenePanelLoaded = "DOTAScenePanelSceneLoaded",
  }
}

declare namespace invk.Events {
  type GameEventName = keyof GameEventDeclarations;
  type GameEventType<T extends GameEventName> = GameEventDeclarations[T];

  type CustomEventName = keyof CustomGameEventDeclarations;
  type CustomEventType<T extends CustomEventName> = CustomGameEventDeclarations[T];

  type EventName = GameEventName | CustomEventName;
  // eslint-disable-next-line @typescript-eslint/ban-types
  type EventType<T extends EventName> = GameEvents.InferGameEventType<T, object>;
  type EventNetworkedData<T extends EventName> = NetworkedData<EventType<T>>;
  type EventListener<T extends EventName> = (event: EventNetworkedData<T>) => void;

  type UIEventName = keyof typeof invk.UIEvents.Name;
  type UIEventListener = (...args: any[]) => void;
}

interface CustomGameEventDeclarations {
  [invk.CustomEvents.Name.PICKER_TOGGLE]: invk.CustomEvents.PickerToggleEvent;
  [invk.CustomEvents.Name.VIEWER_RENDER]: invk.CustomEvents.ViewerRenderEvent;
  [invk.CustomEvents.Name.COMBOS_RELOAD]: invk.CustomEvents.CombosReloadEvent;
  [invk.CustomEvents.Name.COMBO_START]: invk.CustomEvents.ComboStartEvent;
  [invk.CustomEvents.Name.COMBO_STARTED]: invk.CustomEvents.ComboStartedEvent;
  [invk.CustomEvents.Name.COMBO_STOP]: invk.CustomEvents.ComboStopEvent;
  [invk.CustomEvents.Name.COMBO_STOPPED]: invk.CustomEvents.ComboStoppedEvent;
  [invk.CustomEvents.Name.COMBO_IN_PROGRESS]: invk.CustomEvents.ComboInProgressEvent;
  [invk.CustomEvents.Name.COMBO_PROGRESS]: invk.CustomEvents.ComboProgressEvent;
  [invk.CustomEvents.Name.COMBO_STEP_ERROR]: invk.CustomEvents.ComboStepErrorEvent;
  [invk.CustomEvents.Name.COMBO_PRE_FINISH]: invk.CustomEvents.ComboPreFinishEvent;
  [invk.CustomEvents.Name.COMBO_FINISHED]: invk.CustomEvents.ComboFinishedEvent;
  [invk.CustomEvents.Name.COMBO_RESTART]: invk.CustomEvents.ComboRestartEvent;
  [invk.CustomEvents.Name.FREESTYLE_HERO_LEVEL_UP]: invk.CustomEvents.FreestyleHeroLevelUpEvent;
  [invk.CustomEvents.Name.COMBAT_LOG_ABILITY_USED]: invk.CustomEvents.CombatLogAbilityUsedEvent;
  [invk.CustomEvents.Name.COMBAT_LOG_CLEAR]: invk.CustomEvents.CombatLogClearEvent;
  [invk.CustomEvents.Name.COMBAT_LOG_CAPTURE_START]: invk.CustomEvents.CombatLogCaptureStartEvent;
  [invk.CustomEvents.Name.COMBAT_LOG_CAPTURE_STOP]: invk.CustomEvents.CombatLogCaptureStopEvent;
  [invk.CustomEvents.Name.ITEM_PICKER_QUERY]: invk.CustomEvents.ItemPickerQueryEvent;
  [invk.CustomEvents.Name
    .ITEM_PICKER_QUERY_RESPONSE]: invk.CustomEvents.ItemPickerQueryResponseEvent;
  [invk.CustomEvents.Name.POPUP_TEXT_ENTRY_SUBMIT]: invk.CustomEvents.PopupTextEntrySubmitEvent;
  [invk.CustomEvents.Name.POPUP_ITEM_PICKER_SUBMIT]: invk.CustomEvents.PopupItemPickerSubmitEvent;
  [invk.CustomEvents.Name
    .POPUP_ABILITY_PICKER_SUBMIT]: invk.CustomEvents.PopupAbilityPickerSubmitEvent;
}

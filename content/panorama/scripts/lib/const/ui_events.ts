//
// Generated from:
//   - @moddota/dota-data/files/panorama/events.json
//   - data/panorama/events.json
//

import type { PlayerMMRType } from "../dota";

/**
 * Global events */
export enum UIEvent {
  BrowserGoToURL = "BrowserGoToURL",
  DismissAllContextMenus = "DismissAllContextMenus",
  DisplayDashboardTip = "DOTADisplayDashboardTip",
  ExternalBrowserGoToURL = "ExternalBrowserGoToURL",
  HUDGameDisconnect = "DOTAHUDGameDisconnect",
  PageDown = "PageDown",
  PageLeft = "PageLeft",
  PageRight = "PageRight",
  PageUp = "PageUp",
  PlaySoundEffect = "PlaySoundEffect",
  ScrollDown = "ScrollDown",
  ScrollLeft = "ScrollLeft",
  ScrollRight = "ScrollRight",
  ScrollUp = "ScrollUp",
  ShowCustomLayoutPopup = "UIShowCustomLayoutPopup",
  ShowCustomLayoutPopupParameters = "UIShowCustomLayoutPopupParameters",
  ShowMatchDetails = "DOTAShowMatchDetails",
}

/**
 * Panel events */
export enum UIPanelEvent {
  Activated = "Activated",
  AddStyle = "AddStyle",
  AddStyleAfterDelay = "AddStyleAfterDelay",
  AddStyleToEachChild = "AddStyleToEachChild",
  AddTimedStyle = "AddTimedStyle",
  DropInputFocus = "DropInputFocus",
  HideAbilityTooltip = "DOTAHideAbilityTooltip",
  HideBuffTooltip = "DOTAHideBuffTooltip",
  HideCustomLayoutTooltip = "UIHideCustomLayoutTooltip",
  HideDroppedItemTooltip = "DOTAHideDroppedItemTooltip",
  HideEconItemTooltip = "DOTAHideEconItemTooltip",
  HideProfileCardBattleCupTooltip = "DOTAHideProfileCardBattleCupTooltip",
  HideProfileCardTooltip = "DOTAHideProfileCardTooltip",
  HideRankTierTooltip = "DOTAHideRankTierTooltip",
  HideRuneTooltip = "DOTAHideRuneTooltip",
  HideTextTooltip = "DOTAHideTextTooltip",
  HideTitleImageTextTooltip = "DOTAHideTitleImageTextTooltip",
  HideTitleTextTooltip = "DOTAHideTitleTextTooltip",
  LiveStreamUpcoming = "DOTALiveStreamUpcoming",
  LiveStreamVideoLive = "DOTALiveStreamVideoLive",
  MovePanelDown = "MovePanelDown",
  MovePanelLeft = "MovePanelLeft",
  MovePanelRight = "MovePanelRight",
  MovePanelUp = "MovePanelUp",
  PagePanelDown = "PagePanelDown",
  PagePanelLeft = "PagePanelLeft",
  PagePanelRight = "PagePanelRight",
  PagePanelUp = "PagePanelUp",
  PopupButtonClicked = "UIPopupButtonClicked",
  RemoveStyle = "RemoveStyle",
  RemoveStyleAfterDelay = "RemoveStyleAfterDelay",
  RemoveStyleFromEachChild = "RemoveStyleFromEachChild",
  SceneFireEntityInput = "DOTASceneFireEntityInput",
  ScenePanelSceneLoaded = "DOTAScenePanelSceneLoaded",
  ScenePanelSceneUnloaded = "DOTAScenePanelSceneUnloaded",
  ScrollPanelDown = "ScrollPanelDown",
  ScrollPanelLeft = "ScrollPanelLeft",
  ScrollPanelRight = "ScrollPanelRight",
  ScrollPanelUp = "ScrollPanelUp",
  ScrollToBottom = "ScrollToBottom",
  ScrollToTop = "ScrollToTop",
  SetCarouselSelectedChild = "SetCarouselSelectedChild",
  SetChildPanelsSelected = "SetChildPanelsSelected",
  SetInputFocus = "SetInputFocus",
  SetPanelEnabled = "SetPanelEnabled",
  SetPanelSelected = "SetPanelSelected",
  ShowAbilityInventoryItemTooltip = "DOTAShowAbilityInventoryItemTooltip",
  ShowAbilityShopItemTooltip = "DOTAShowAbilityShopItemTooltip",
  ShowAbilityTooltip = "DOTAShowAbilityTooltip",
  ShowAbilityTooltipForEntityIndex = "DOTAShowAbilityTooltipForEntityIndex",
  ShowAbilityTooltipForGuide = "DOTAShowAbilityTooltipForGuide",
  ShowAbilityTooltipForHero = "DOTAShowAbilityTooltipForHero",
  ShowAbilityTooltipForLevel = "DOTAShowAbilityTooltipForLevel",
  ShowBuffTooltip = "DOTAShowBuffTooltip",
  ShowCustomLayoutParametersTooltip = "UIShowCustomLayoutParametersTooltip",
  ShowCustomLayoutTooltip = "UIShowCustomLayoutTooltip",
  ShowEconItemTooltip = "DOTAShowEconItemTooltip",
  ShowProfileCardBattleCupTooltip = "DOTAShowProfileCardBattleCupTooltip",
  ShowProfileCardTooltip = "DOTAShowProfileCardTooltip",
  ShowRankTierTooltip = "DOTAShowRankTierTooltip",
  ShowRuneTooltip = "DOTAShowRuneTooltip",
  ShowTextTooltip = "DOTAShowTextTooltip",
  ShowTextTooltipStyled = "DOTAShowTextTooltipStyled",
  ShowTitleImageTextTooltip = "DOTAShowTitleImageTextTooltip",
  ShowTitleImageTextTooltipStyled = "DOTAShowTitleImageTextTooltipStyled",
  ShowTitleTextTooltip = "DOTAShowTitleTextTooltip",
  ShowTitleTextTooltipStyled = "DOTAShowTitleTextTooltipStyled",
  SwitchStyle = "SwitchStyle",
  TabSelected = "TabSelected",
  TogglePanelSelected = "TogglePanelSelected",
  ToggleStyle = "ToggleStyle",
  TriggerStyle = "TriggerStyle",
}

/**
 * Mapping of event names to event types */
export interface UIEventDeclarations {
  [UIEvent.BrowserGoToURL]: BrowserGoToURL;
  [UIEvent.DismissAllContextMenus]: DismissAllContextMenus;
  [UIEvent.DisplayDashboardTip]: DisplayDashboardTip;
  [UIEvent.ExternalBrowserGoToURL]: ExternalBrowserGoToURL;
  [UIEvent.HUDGameDisconnect]: HUDGameDisconnect;
  [UIEvent.PageDown]: PageDown;
  [UIEvent.PageLeft]: PageLeft;
  [UIEvent.PageRight]: PageRight;
  [UIEvent.PageUp]: PageUp;
  [UIEvent.PlaySoundEffect]: PlaySoundEffect;
  [UIEvent.ScrollDown]: ScrollDown;
  [UIEvent.ScrollLeft]: ScrollLeft;
  [UIEvent.ScrollRight]: ScrollRight;
  [UIEvent.ScrollUp]: ScrollUp;
  [UIEvent.ShowCustomLayoutPopup]: ShowCustomLayoutPopup;
  [UIEvent.ShowCustomLayoutPopupParameters]: ShowCustomLayoutPopupParameters;
  [UIEvent.ShowMatchDetails]: ShowMatchDetails;
  [UIPanelEvent.Activated]: Activated;
  [UIPanelEvent.AddStyle]: AddStyle;
  [UIPanelEvent.AddStyleAfterDelay]: AddStyleAfterDelay;
  [UIPanelEvent.AddStyleToEachChild]: AddStyleToEachChild;
  [UIPanelEvent.AddTimedStyle]: AddTimedStyle;
  [UIPanelEvent.DropInputFocus]: DropInputFocus;
  [UIPanelEvent.HideAbilityTooltip]: HideAbilityTooltip;
  [UIPanelEvent.HideBuffTooltip]: HideBuffTooltip;
  [UIPanelEvent.HideCustomLayoutTooltip]: HideCustomLayoutTooltip;
  [UIPanelEvent.HideDroppedItemTooltip]: HideDroppedItemTooltip;
  [UIPanelEvent.HideEconItemTooltip]: HideEconItemTooltip;
  [UIPanelEvent.HideProfileCardBattleCupTooltip]: HideProfileCardBattleCupTooltip;
  [UIPanelEvent.HideProfileCardTooltip]: HideProfileCardTooltip;
  [UIPanelEvent.HideRankTierTooltip]: HideRankTierTooltip;
  [UIPanelEvent.HideRuneTooltip]: HideRuneTooltip;
  [UIPanelEvent.HideTextTooltip]: HideTextTooltip;
  [UIPanelEvent.HideTitleImageTextTooltip]: HideTitleImageTextTooltip;
  [UIPanelEvent.HideTitleTextTooltip]: HideTitleTextTooltip;
  [UIPanelEvent.LiveStreamUpcoming]: LiveStreamUpcoming;
  [UIPanelEvent.LiveStreamVideoLive]: LiveStreamVideoLive;
  [UIPanelEvent.MovePanelDown]: MovePanelDown;
  [UIPanelEvent.MovePanelLeft]: MovePanelLeft;
  [UIPanelEvent.MovePanelRight]: MovePanelRight;
  [UIPanelEvent.MovePanelUp]: MovePanelUp;
  [UIPanelEvent.PagePanelDown]: PagePanelDown;
  [UIPanelEvent.PagePanelLeft]: PagePanelLeft;
  [UIPanelEvent.PagePanelRight]: PagePanelRight;
  [UIPanelEvent.PagePanelUp]: PagePanelUp;
  [UIPanelEvent.PopupButtonClicked]: PopupButtonClicked;
  [UIPanelEvent.RemoveStyle]: RemoveStyle;
  [UIPanelEvent.RemoveStyleAfterDelay]: RemoveStyleAfterDelay;
  [UIPanelEvent.RemoveStyleFromEachChild]: RemoveStyleFromEachChild;
  [UIPanelEvent.SceneFireEntityInput]: SceneFireEntityInput;
  [UIPanelEvent.ScenePanelSceneLoaded]: ScenePanelSceneLoaded;
  [UIPanelEvent.ScenePanelSceneUnloaded]: ScenePanelSceneUnloaded;
  [UIPanelEvent.ScrollPanelDown]: ScrollPanelDown;
  [UIPanelEvent.ScrollPanelLeft]: ScrollPanelLeft;
  [UIPanelEvent.ScrollPanelRight]: ScrollPanelRight;
  [UIPanelEvent.ScrollPanelUp]: ScrollPanelUp;
  [UIPanelEvent.ScrollToBottom]: ScrollToBottom;
  [UIPanelEvent.ScrollToTop]: ScrollToTop;
  [UIPanelEvent.SetCarouselSelectedChild]: SetCarouselSelectedChild;
  [UIPanelEvent.SetChildPanelsSelected]: SetChildPanelsSelected;
  [UIPanelEvent.SetInputFocus]: SetInputFocus;
  [UIPanelEvent.SetPanelEnabled]: SetPanelEnabled;
  [UIPanelEvent.SetPanelSelected]: SetPanelSelected;
  [UIPanelEvent.ShowAbilityInventoryItemTooltip]: ShowAbilityInventoryItemTooltip;
  [UIPanelEvent.ShowAbilityShopItemTooltip]: ShowAbilityShopItemTooltip;
  [UIPanelEvent.ShowAbilityTooltip]: ShowAbilityTooltip;
  [UIPanelEvent.ShowAbilityTooltipForEntityIndex]: ShowAbilityTooltipForEntityIndex;
  [UIPanelEvent.ShowAbilityTooltipForGuide]: ShowAbilityTooltipForGuide;
  [UIPanelEvent.ShowAbilityTooltipForHero]: ShowAbilityTooltipForHero;
  [UIPanelEvent.ShowAbilityTooltipForLevel]: ShowAbilityTooltipForLevel;
  [UIPanelEvent.ShowBuffTooltip]: ShowBuffTooltip;
  [UIPanelEvent.ShowCustomLayoutParametersTooltip]: ShowCustomLayoutParametersTooltip;
  [UIPanelEvent.ShowCustomLayoutTooltip]: ShowCustomLayoutTooltip;
  [UIPanelEvent.ShowEconItemTooltip]: ShowEconItemTooltip;
  [UIPanelEvent.ShowProfileCardBattleCupTooltip]: ShowProfileCardBattleCupTooltip;
  [UIPanelEvent.ShowProfileCardTooltip]: ShowProfileCardTooltip;
  [UIPanelEvent.ShowRankTierTooltip]: ShowRankTierTooltip;
  [UIPanelEvent.ShowRuneTooltip]: ShowRuneTooltip;
  [UIPanelEvent.ShowTextTooltip]: ShowTextTooltip;
  [UIPanelEvent.ShowTextTooltipStyled]: ShowTextTooltipStyled;
  [UIPanelEvent.ShowTitleImageTextTooltip]: ShowTitleImageTextTooltip;
  [UIPanelEvent.ShowTitleImageTextTooltipStyled]: ShowTitleImageTextTooltipStyled;
  [UIPanelEvent.ShowTitleTextTooltip]: ShowTitleTextTooltip;
  [UIPanelEvent.ShowTitleTextTooltipStyled]: ShowTitleTextTooltipStyled;
  [UIPanelEvent.SwitchStyle]: SwitchStyle;
  [UIPanelEvent.TabSelected]: TabSelected;
  [UIPanelEvent.TogglePanelSelected]: TogglePanelSelected;
  [UIPanelEvent.ToggleStyle]: ToggleStyle;
  [UIPanelEvent.TriggerStyle]: TriggerStyle;
}

/**
 * Event names type */
export type UIEventName = keyof UIEventDeclarations;

/**
 * Received when a Button is activated. */
export type Activated = [];

/**
 * Add a CSS class to a panel. */
export type AddStyle = [className: string];

/**
 * Add a CSS class to a panel after a specified delay. */
export type AddStyleAfterDelay = [className: string, preDelay: number];

/**
 * Add a CSS class to all children of this panel. */
export type AddStyleToEachChild = [className: string];

/**
 * Add a class for a specified duration, with optional pre-delay; clears existing timers when called with same class. */
export type AddTimedStyle = [className: string, duration: number, preDelay: number];

/**
 * BrowserGoToURL */
export type BrowserGoToURL = [url: string];

/**
 * DismissAllContextMenus */
export type DismissAllContextMenus = [];

/**
 * Tip to display, panel to attach to (default 'DefaultTipAttachment') */
export type DisplayDashboardTip = [string: string, optional: string];

/**
 * Drop focus entirely from the window containing this panel. */
export type DropInputFocus = [];

/**
 * ExternalBrowserGoToURL */
export type ExternalBrowserGoToURL = [url: string];

/**
 * Hide the ability tooltip */
export type HideAbilityTooltip = [];

/**
 * Hide the buff tooltip */
export type HideBuffTooltip = [];

/**
 * Hides a custom layout tooltip. */
export type HideCustomLayoutTooltip = [id: string];

/**
 * Hide the dropped item tooltip */
export type HideDroppedItemTooltip = [];

/**
 * Hide the econ item tooltip. */
export type HideEconItemTooltip = [];

/**
 * Hide the profile card / battle cup tooltip. */
export type HideProfileCardBattleCupTooltip = [];

/**
 * Hide the profile card tooltip. */
export type HideProfileCardTooltip = [];

/**
 * Hide the rank tier tooltip. */
export type HideRankTierTooltip = [];

/**
 * Hide the rune tooltip */
export type HideRuneTooltip = [];

/**
 * Hide the text tooltip */
export type HideTextTooltip = [];

/**
 * Hide the title image text tooltip. */
export type HideTitleImageTextTooltip = [];

/**
 * Hide the title text tooltip. */
export type HideTitleTextTooltip = [];

/**
 * DOTAHUDGameDisconnect */
export type HUDGameDisconnect = [];

/**
 * Notify change in RTime32 we expect the stream to start */
export type LiveStreamUpcoming = [time: number];

/**
 * Notify change in video state (is it pointing at a live stream page or not) */
export type LiveStreamVideoLive = [isLive: boolean];

/**
 * Move down from the panel.
 * By default, this will change the focus position, but other panel types may implement this differently. */
export type MovePanelDown = [repeatCount: number];

/**
 * Move left from the panel.
 * By default, this will change the focus position, but other panel types may implement this differently. */
export type MovePanelLeft = [repeatCount: number];

/**
 * Move right from the panel.
 * By default, this will change the focus position, but other panel types may implement this differently. */
export type MovePanelRight = [repeatCount: number];

/**
 * Move up from the panel.
 * By default, this will change the focus position, but other panel types may implement this differently. */
export type MovePanelUp = [repeatCount: number];

/**
 * Scroll the panel down by one page. */
export type PageDown = [];

/**
 * Scroll the panel left by one page. */
export type PageLeft = [];

/**
 * Scroll the panel down by one page. */
export type PagePanelDown = [];

/**
 * Scroll the panel left by one page. */
export type PagePanelLeft = [];

/**
 * Scroll the panel left by one page. */
export type PagePanelRight = [];

/**
 * Scroll the panel up by one page. */
export type PagePanelUp = [];

/**
 * Scroll the panel right by one page. */
export type PageRight = [];

/**
 * Scroll the panel up by one page. */
export type PageUp = [];

/**
 * Plays a sound effect. */
export type PlaySoundEffect = [soundEvent: string];

/**
 * Dismisses a popup. */
export type PopupButtonClicked = [];

/**
 * Remove a CSS class from a panel. */
export type RemoveStyle = [className: string];

/**
 * Remove a CSS class from a panel after a specified delay. */
export type RemoveStyleAfterDelay = [className: string, preDelay: number];

/**
 * Remove a CSS class from all children of this panel. */
export type RemoveStyleFromEachChild = [className: string];

/**
 * Fires an entity input within a DOTAScenelPanel. */
export type SceneFireEntityInput = [entityID: string, inputName: string, value: string];

/**
 * Received when a DOTAScenePanel finished loading. */
export type ScenePanelSceneLoaded = [];

/**
 * Received when a DOTAScenePanel unloaded. */
export type ScenePanelSceneUnloaded = [];

/**
 * Scroll the panel down by one line. */
export type ScrollDown = [];

/**
 * Scroll the panel left by one line. */
export type ScrollLeft = [];

/**
 * Scroll the panel down by one line. */
export type ScrollPanelDown = [];

/**
 * Scroll the panel left by one line. */
export type ScrollPanelLeft = [];

/**
 * Scroll the panel right by one line. */
export type ScrollPanelRight = [];

/**
 * Scroll the panel up by one line. */
export type ScrollPanelUp = [];

/**
 * Scroll the panel right by one line. */
export type ScrollRight = [];

/**
 * Scroll this panel to the bottom. */
export type ScrollToBottom = [];

/**
 * Scroll this panel to the top. */
export type ScrollToTop = [];

/**
 * Scroll the panel up by one line. */
export type ScrollUp = [];

/**
 * Received when a Carousel child panel is selected. */
export type SetCarouselSelectedChild = [selectedPanel: Panel];

/**
 * Set whether any child panels are :selected. */
export type SetChildPanelsSelected = [selected: boolean];

/**
 * Set focus to this panel. */
export type SetInputFocus = [];

/**
 * Sets whether the given panel is enabled */
export type SetPanelEnabled = [enabled: boolean];

/**
 * Set whether this panel is :selected. */
export type SetPanelSelected = [selected: boolean];

/**
 * Show tooltip for an item in the entityIndex NPC's inventory. */
export type ShowAbilityInventoryItemTooltip = [entityIndex: number, inventorySlot: number];

/**
 * Show tooltip for an item in the entityIndex NPC's shop. */
export type ShowAbilityShopItemTooltip = [
  abilityName: string,
  guideName: string,
  entityIndex: number
];

/**
 * Show an ability tooltip. */
export type ShowAbilityTooltip = [abilityName: string];

/**
 * Show an ability tooltip.
 * Level information comes from the entity specified by the entityIndex. */
export type ShowAbilityTooltipForEntityIndex = [abilityName: string, entityIndex: number];

/**
 * Show an ability tooltip annotated with a particular guide's info. */
export type ShowAbilityTooltipForGuide = [abilityName: string, guideName: string];

/**
 * Show an ability tooltip for the specified hero. */
export type ShowAbilityTooltipForHero = [abilityName: string, heroid: number, arg3: boolean];

/**
 * Show an ability tooltip for a specific level. */
export type ShowAbilityTooltipForLevel = [level: string, arg2: number];

/**
 * Show a buff tooltip for the specified entityIndex + buff serial. */
export type ShowBuffTooltip = [entityIndex: number, buffSerial: number, onEnemy: boolean];

/**
 * Shows a custom layout tooltip with parameters (query string format). */
export type ShowCustomLayoutParametersTooltip = [
  id: string,
  layoutPath: string,
  parameters: string
];

/**
 * Shows a popup with a custom layout. */
export type ShowCustomLayoutPopup = [id: string, layoutPath: string];

/**
 * Shows a popup with a custom layout and parameters (query string format). */
export type ShowCustomLayoutPopupParameters = [id: string, layoutPath: string, parameters: string];

/**
 * Shows a custom layout tooltip. */
export type ShowCustomLayoutTooltip = [id: string, layoutPath: string];

/**
 * Show the econ item tooltip for a given item, style, and hero.
 * Use 0 for the default style, and -1 for the default hero. */
export type ShowEconItemTooltip = [itemDef: number, styleIndex: number, heroId: number];

/**
 * DOTAShowMatchDetails */
export type ShowMatchDetails = [matchId: number];

/**
 * Show the battle cup portion of the user's profile card, if it exists */
export type ShowProfileCardBattleCupTooltip = [steamId: number];

/**
 * Show a user's profile card.
 * Use pro name determines whether to use their professional team name if applicable. */
export type ShowProfileCardTooltip = [steamId: number, useProName: boolean];

/**
 * Show the rank tier tooltip for a user */
export type ShowRankTierTooltip = [steamId: number, edotaPlayerMmrType: PlayerMMRType];

/**
 * Show a rune tooltip in the X Y location for the rune type */
export type ShowRuneTooltip = [x: number, y: number, runeType: number];

/**
 * Show a tooltip with the given text. */
export type ShowTextTooltip = [text: string];

/**
 * Show a tooltip with the given text.
 * Also apply a CSS class named "style" to allow custom styling. */
export type ShowTextTooltipStyled = [text: string, style: string];

/**
 * Show a tooltip with the given title, image, and text. */
export type ShowTitleImageTextTooltip = [title: string, imagePath: string, text: string];

/**
 * Show a tooltip with the given title, image, and text.
 * Also apply a CSS class named "style" to allow custom styling. */
export type ShowTitleImageTextTooltipStyled = [
  title: string,
  imagePath: string,
  text: string,
  style: string
];

/**
 * Show a tooltip with the given title and text. */
export type ShowTitleTextTooltip = [title: string, text: string];

/**
 * Show a tooltip with the given title and text.
 * Also apply a CSS class named "style" to allow custom styling. */
export type ShowTitleTextTooltipStyled = [title: string, text: string, style: string];

/**
 * Switch which class the panel has for a given attribute slot.
 * Allows easily changing between multiple states. */
export type SwitchStyle = [slot: string, className: string];

/**
 * Received when a TabButton is checked. */
export type TabSelected = [];

/**
 * Toggle whether this panel is :selected. */
export type TogglePanelSelected = [];

/**
 * Toggle whether a panel has the given CSS class. */
export type ToggleStyle = [className: string];

/**
 * Remove then immediately add back a CSS class from a panel.
 * Useful to re-trigger events like animations or sound effects. */
export type TriggerStyle = [className: string];

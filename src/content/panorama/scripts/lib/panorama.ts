import { isItemAbility } from "./dota2/items";

export enum PanelType {
  Panel = "Panel",

  Label = "Label",

  Image = "Image",
  AbilityImage = "DOTAAbilityImage",
  ItemImage = "DOTAItemImage",
  HeroImage = "DOTAHeroImage",
  CountryFlagImage = "DOTACountryFlagImage",
  LeagueImage = "DOTALeagueImage",
  EconItemImage = "EconItemImage",

  AnimatedImageStrip = "AnimatedImageStrip",
  Emoticon = "DOTAEmoticon",

  Movie = "Movie",
  HeroMovie = "DOTAHeroMovie",

  ScenePanel = "DOTAScenePanel",
  ParticleScenePanel = "DOTAParticleScenePanel",
  EconItem = "DOTAEconItem",

  ProgressBar = "ProgressBar",
  CircularProgressBar = "CircularProgressBar",
  ProgressBarWithMiddle = "ProgressBarWithMiddle",

  UserName = "DOTAUserName",
  UserRichPresence = "DOTAUserRichPresence",
  AvatarImage = "DOTAAvatarImage",

  Countdown = "Countdown",

  Button = "Button",
  TextButton = "TextButton",
  ToggleButton = "ToggleButton",
  SettingsCheckbox = "DOTASettingsCheckbox",
  RadioButton = "RadioButton",

  TextEntry = "TextEntry",
  ShopTextEntry = "DOTAHUDShopTextEntry",
  NumberEntry = "NumberEntry",
  Slider = "Slider",
  SlottedSlider = "SlottedSlider",

  DropDown = "DropDown",
  ContextMenuScript = "ContextMenuScript",

  Carousel = "Carousel",
  HeroSetList = "DOTAHeroSetList",
  CarouselNav = "CarouselNav",

  OverlayMap = "DOTAHUDOverlayMap",
  Minimap = "DOTAMinimap",

  Html = "HTML",
  AccountLinkHtml = "DOTAAccountLinkHTML",
  HtmlPanel = "DOTAHTMLPanel",
  StoreCustomControls = "DOTAStoreCustomControls",

  CustomLayoutPanel = "CustomLayoutPanel",
}

export type PanelEventListener = () => void;

export enum UiEvent {
  BrowserGoToUrl = "ExternalBrowserGoToURL",
  PlaySound = "PlaySoundEffect",
  ShowTooltip = "UIShowCustomLayoutTooltip",
  ShowTooltipParams = "UIShowCustomLayoutParametersTooltip",
  HideTooltip = "UIHideCustomLayoutTooltip",
  ShowTextTooltip = "DOTAShowTextTooltip",
  HideTextTooltip = "DOTAHideTextTooltip",
  ShowAbilityTooltip = "DOTAShowAbilityTooltip",
  ShowAbilityTooltipEntityIndex = "DOTAShowAbilityTooltipForEntityIndex",
  ShowAbilityTooltipGuide = "DOTAShowAbilityTooltipForGuide",
  ShowAbilityTooltipHero = "DOTAShowAbilityTooltipForHero",
  ShowAbilityTooltipLevel = "DOTAShowAbilityTooltipForLevel",
  HideAbilityTooltip = "DOTAHideAbilityTooltip",
  ShowHeroStatBranchTooltip = "DOTAHUDShowHeroStatBranchTooltip",
  HideHeroStatBranchTooltip = "DOTAHUDHideStatBranchTooltip",
  ShowPopup = "UIShowCustomLayoutPopup",
  ShowPopupParams = "UIShowCustomLayoutPopupParameters",
  PopupButtonClicked = "UIPopupButtonClicked",
  ScenePanelLoaded = "DOTAScenePanelSceneLoaded",
  FacetDropdownFacetSelected = "DOTAHeroFacetDropdownFacetSelected",
}

// TODO: parameterize payloads by `UiEvent`
export type UiEventListener = (...args: unknown[]) => void;

export enum SoundEvent {
  Death = "ui.death_stinger",
  InvokationFreestyleStart = "Invokation.Freestyle.Start",
  InvokerKidTakeoverSfx = "kidvoker_takeover_sfx",
  InvokerKidTakeoverStinger = "kidvoker_takeover_stinger",
  ShopClose = "Shop.PanelDown",
  ShopOpen = "Shop.PanelUp",
  UiRolloverDown = "ui_rollover_md_down",
  UiRolloverUp = "ui_rollover_md_up",
}

export type SerializableParams = string | Record<string, unknown>;

export type AbilityTooltipParams =
  | { entityIndex: number }
  | { guide: string }
  | { hero: number; flag: number }
  | { level: number };

export function createPanel<T extends Panel>(
  parent: Panel,
  id: string,
  layout: string,
  override = false,
  partial = false,
): T {
  const panel = $.CreatePanel(PanelType.Panel, parent, id) as T;

  if (!panel.BLoadLayout(layout, override, partial)) {
    throw new Error(`Could not load layout ${layout} into Panel ${id} (parent: ${parent.id})`);
  }

  return panel;
}

export function createPanelSnippet<T extends Panel>(parent: Panel, id: string, snippet: string): T {
  const panel = $.CreatePanel(PanelType.Panel, parent, id) as T;

  if (!panel.BHasLayoutSnippet(snippet)) {
    throw new Error(`Layout snippet ${snippet} not found in Panel ${id} (parent: ${parent.id})`);
  }

  if (!panel.BLoadLayoutSnippet(snippet)) {
    throw new Error(
      `Could not load layout snippet ${snippet} into Panel ${id} (parent: ${parent.id})`,
    );
  }

  return panel;
}

export function createLabel(parent: Panel, id: string, text?: string): LabelPanel {
  const panel = $.CreatePanel(PanelType.Label, parent, id);

  if (text != null) {
    panel.text = text;
  }

  return panel;
}

export function createAbilityImage(parent: Panel, id: string, abilityName: string): AbilityImage {
  const panel = $.CreatePanel(PanelType.AbilityImage, parent, id);

  panel.abilityname = abilityName;

  return panel;
}

export function createItemImage(parent: Panel, id: string, itemName: string): ItemImage {
  const panel = $.CreatePanel(PanelType.ItemImage, parent, id);

  panel.itemname = itemName;

  return panel;
}

export function createAbilityOrItemImage(parent: Panel, id: string, abilityName: string) {
  if (isItemAbility(abilityName)) {
    return createItemImage(parent, id, abilityName);
  }

  return createAbilityImage(parent, id, abilityName);
}

export function serializeParams(params: SerializableParams): string {
  if (typeof params === "string") {
    return params;
  }

  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export type DebugPanel = string | { id: string; type: string; layoutfile: string };

export function debugPanel(panel: Panel | undefined): DebugPanel {
  if (panel == null) {
    return "<undefined>";
  }

  const { id, type, layoutfile } = panel;

  return { id, type, layoutfile };
}

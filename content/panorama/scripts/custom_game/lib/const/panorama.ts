import { transform } from "lodash";

export enum PanelType {
  Panel = "Panel",
  Label = "Label",

  Image = "Image",
  AbilityImage = "DOTAAbilityImage",
  ItemImage = "DOTAItemImage",
  HeroImage = "DOTAHeroImage",
  CountryFlagImage = "DOTACountryFlagImage",
  LeagueImage = "DOTALeagueImage",
  EconItem = "DOTAEconItem",
  EconItemImage = "EconItemImage",
  HeroRelicImage = "DOTAHeroRelicImage",
  TrophyImage = "DOTATrophyImage",
  UgcImage = "DOTAUGCImage",

  AnimatedImageStrip = "AnimatedImageStrip",
  Emoticon = "DOTAEmoticon",

  Movie = "Movie",
  HeroMovie = "DOTAHeroMovie",

  Scene = "DOTAScenePanel",

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
  TextEntryAutocomplete = "TextEntryAutocomplete",
  HUDShopTextEntry = "DOTAHUDShopTextEntry",
  NumberEntry = "NumberEntry",
  Slider = "Slider",
  SlottedSlider = "SlottedSlider",

  DropDown = "DropDown",
  DropDownMenu = "DropDownMenu",
  ContextMenuScript = "ContextMenuScript",
  SimpleContextMenu = "SimpleContextMenu",

  Carousel = "Carousel",
  CarouselNav = "CarouselNav",
  HeroSetList = "DOTAHeroSetList",

  TabButton = "TabButton",
  TabContents = "TabContents",

  HUDOverlayMap = "DOTAHUDOverlayMap",
  Minimap = "DOTAMinimap",

  HTML = "HTML",
  AccountLinkHTML = "DOTAAccountLinkHTML",
  HTMLPanel = "DOTAHTMLPanel",
  StoreCustomControls = "DOTAStoreCustomControls",

  CustomLayoutPanel = "CustomLayoutPanel",

  DragZoom = "DragZoom",
  EdgeScrollBar = "EdgeScrollBar",
  EdgeScroller = "EdgeScroller",
  HscrollBar = "HorizontalScrollBar",
  VscrollBar = "VerticalScrollBar",
}

export const PANEL_TYPES = transform(
  PanelType,
  (types, value, key) => {
    types[value] = key;
  },
  {} as { [key: string]: string }
);

export enum CSSClass {
  Development = "development",
  Hide = "Hide",
  Show = "Show",
  Activated = "Activated",
  SceneLoaded = "SceneLoaded",
}

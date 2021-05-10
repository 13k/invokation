import { transform } from "lodash";

import type { Component } from "../component";

// --------------------------------------------------
// Helper types
// --------------------------------------------------

export type WithComponent<T extends PanelBase, C extends Component> = T & { component: C };
export type PanelWithComponent<C extends Component> = WithComponent<Panel, C>;
export type PanelWithText = Panel & { text: string };

export type AbilityImageOwn = Omit<AbilityImage, keyof Panel>;
export type AbilityImageOwnWritable = Writable<AbilityImageOwn>;

export type ItemImageOwn = Omit<ItemImage, keyof Panel>;
export type ItemImageOwnWritable = Writable<ItemImageOwn>;

export type HeroImageOwn = Omit<HeroImage, keyof Panel>;
export type HeroImageOwnWritable = Writable<HeroImageOwn>;

export type ProgressBarOwn = Omit<ProgressBar, keyof Panel>;
export type ProgressBarOwnWritable = Writable<ProgressBarOwn>;

// --------------------------------------------------
// Enums and constants
// --------------------------------------------------

export enum CSSClass {
  Development = "development",
  Hide = "Hide",
  Show = "Show",
  Activated = "Activated",
  SceneLoaded = "SceneLoaded",
}

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

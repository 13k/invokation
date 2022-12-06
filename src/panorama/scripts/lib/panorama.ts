/// <reference path="./vendor/lodash.js" />
/// <reference path="dota2.ts" />

namespace invk {
  export namespace Panorama {
    const {
      Dota2: { isItemAbility },
    } = invk;

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

      HTML = "HTML",
      AccountLinkHTML = "DOTAAccountLinkHTML",
      HTMLPanel = "DOTAHTMLPanel",
      StoreCustomControls = "DOTAStoreCustomControls",

      CustomLayoutPanel = "CustomLayoutPanel",
    }

    export enum UIEvent {
      EXTERNAL_BROWSER_GO_TO_URL = "ExternalBrowserGoToURL",
      PLAY_SOUND = "PlaySoundEffect",
      SHOW_TOOLTIP = "UIShowCustomLayoutTooltip",
      SHOW_TOOLTIP_PARAMS = "UIShowCustomLayoutParametersTooltip",
      HIDE_TOOLTIP = "UIHideCustomLayoutTooltip",
      SHOW_TEXT_TOOLTIP = "DOTAShowTextTooltip",
      HIDE_TEXT_TOOLTIP = "DOTAHideTextTooltip",
      SHOW_ABILITY_TOOLTIP = "DOTAShowAbilityTooltip",
      SHOW_ABILITY_TOOLTIP_ENTITY_INDEX = "DOTAShowAbilityTooltipForEntityIndex",
      SHOW_ABILITY_TOOLTIP_GUIDE = "DOTAShowAbilityTooltipForGuide",
      SHOW_ABILITY_TOOLTIP_HERO = "DOTAShowAbilityTooltipForHero",
      SHOW_ABILITY_TOOLTIP_LEVEL = "DOTAShowAbilityTooltipForLevel",
      HIDE_ABILITY_TOOLTIP = "DOTAHideAbilityTooltip",
      SHOW_HERO_STAT_BRANCH_TOOLTIP = "DOTAHUDShowHeroStatBranchTooltip",
      HIDE_HERO_STAT_BRANCH_TOOLTIP = "DOTAHUDHideStatBranchTooltip",
      SHOW_POPUP = "UIShowCustomLayoutPopup",
      SHOW_POPUP_PARAMS = "UIShowCustomLayoutPopupParameters",
      POPUP_BUTTON_CLICKED = "UIPopupButtonClicked",
      SCENE_PANEL_LOADED = "DOTAScenePanelSceneLoaded",
    }

    export enum SoundEvent {
      Death = "ui.death_stinger",
      InvokationFreestyleStart = "Invokation.Freestyle.Start",
      InvokerKidTakeoverSfx = "kidvoker_takeover_sfx",
      InvokerKidTakeoverStinger = "kidvoker_takeover_stinger",
      ShopClose = "Shop.PanelDown",
      ShopOpen = "Shop.PanelUp",
      UIRolloverDown = "ui_rollover_md_down",
      UIRolloverUp = "ui_rollover_md_up",
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type SerializableParams = string | Record<string, any>;

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
      partial = false
    ): T {
      const panel = $.CreatePanel(PanelType.Panel, parent, id) as T;

      if (!panel.BLoadLayout(layout, override, partial)) {
        throw new Error(`Could not load layout ${layout} into Panel ${id} (parent: ${parent.id})`);
      }

      return panel;
    }

    export function createPanelSnippet<T extends Panel>(
      parent: Panel,
      id: string,
      snippet: string
    ): T {
      const panel = $.CreatePanel(PanelType.Panel, parent, id) as T;

      if (!panel.BHasLayoutSnippet(snippet)) {
        throw new Error(
          `Layout snippet ${snippet} not found in Panel ${id} (parent: ${parent.id})`
        );
      }

      if (!panel.BLoadLayoutSnippet(snippet)) {
        throw new Error(
          `Could not load layout snippet ${snippet} into Panel ${id} (parent: ${parent.id})`
        );
      }

      return panel;
    }

    export function createAbilityImage(
      parent: Panel,
      id: string,
      abilityName: string
    ): AbilityImage {
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
      if (_.isString(params)) {
        return params;
      }

      return _.chain(params)
        .map((value, key) => `${key}=${value}`)
        .join("&")
        .value();
    }
  }
}

const { get } = require("lodash");
const rationalOrderConfig = require("stylelint-config-rational-order");

const rationalOrderPropertyNoUnknownIgnore = get(
  rationalOrderConfig,
  ["rules", "property-no-unknown", "1", "ignoreProperties"],
  []
);

const panoramaTypes = [
  "/^DOTA/",
  "Button",
  "DragZoom",
  "DropDown",
  "DropDownMenu",
  "EdgeScrollBar",
  "EdgeScroller",
  "HorizontalScrollBar",
  "Image",
  "Label",
  "NumberEntry",
  "Panel",
  "ProgressBar",
  "RadioButton",
  "SimpleContextMenu",
  "Slider",
  "SlottedSlider",
  "TextButton",
  "TextEntry",
  "TextEntryAutocomplete",
  "ToggleButton",
  "VerticalScrollBar",
];

const panoramaPropertyGroups = {
  positioning: [],
  boxModel: ["flow-children", "horizontal-align", "vertical-align", "align"],
  typography: [],
  visual: [
    "brightness",
    "contrast",
    "hue-rotation",
    "opacity-mask",
    "pre-transform-scale2d",
    "saturation",
    "wash-color",
  ],
  animation: [],
  misc: ["sound", "tooltip-body-position", "tooltip-position"],
};

const panoramaProperties = Object.values(panoramaPropertyGroups).flat();

const panoramaCorePopupsClasses = [
  "PopupTitle", // .PopupPanel
  "PopupDescription", // .PopupPanel
  "PopupButtonRow", // .PopupPanel
  "Multiline", // .PopupPanel
];

const panoramaDotaStylesClasses = [
  "Hide", // Panel
  "Show", // Panel
  "SceneLoaded", // DOTAScenePanel
  "Activated", // Button
  "CloseButton", // Button
  "RefreshButton", // Button
  "TickBox", // ToggleButton
];

const panoramaClasses = [...panoramaCorePopupsClasses, ...panoramaDotaStylesClasses];
const panoramaClassesMessage = `or be one of: ${panoramaClasses.join(", ")}`;
const selectorClassPattern = `^([a-z0-9\\-]+|${panoramaClasses.join("|")})$`;

module.exports = {
  reportNeedlessDisables: true,
  reportInvalidScopeDisables: true,
  reportDescriptionlessDisables: true,
  extends: [
    "stylelint-config-standard",
    "stylelint-config-sass-guidelines",
    "stylelint-config-rational-order",
    "stylelint-config-prettier",
  ],
  rules: {
    "font-family-no-missing-generic-family-keyword": null,
    "keyframes-name-pattern": "^[a-z]([a-z-]+[a-z])?$",
    "max-nesting-depth": [
      2,
      {
        ignoreAtRules: ["each", "media", "supports", "include"],
      },
    ],
    "property-no-unknown": [
      true,
      {
        ignoreProperties: [...rationalOrderPropertyNoUnknownIgnore, ...panoramaProperties],
      },
    ],
    "selector-max-id": 1,
    "selector-class-pattern": [
      selectorClassPattern,
      {
        message: `Selector should be written in lowercase with hyphens ${panoramaClassesMessage} (selector-class-pattern)`,
      },
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["selected"],
      },
    ],
    "selector-type-case": [
      "lower",
      {
        ignoreTypes: panoramaTypes,
      },
    ],
    "selector-type-no-unknown": [
      true,
      {
        ignoreTypes: panoramaTypes,
      },
    ],
    "order/properties-alphabetical-order": null,
  },
};

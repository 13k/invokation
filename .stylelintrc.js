const recessPropertyGroups = require("stylelint-config-recess-order/groups");

const PANORAMA_TYPES = [
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

const PANORAMA_PROPERTY_GROUPS = [
  // compose
  [],
  // all
  [],
  // position
  [],
  // display
  [],
  // flex
  ["flow-children"],
  // grid
  [],
  // gap
  [],
  // layout
  ["align", "horizontal-align"],
  // order
  [],
  // box model
  [],
  // typography
  [],
  // accessibility & interactions
  ["tooltip-body-position", "tooltip-position"],
  // images, backgrounds, & borders
  ["brightness", "blur", "contrast", "saturation", "wash-color"],
  // masking
  ["opacity-mask"],
  // svg
  [],
  // transitions & animation
  ["pre-transform-scale2d", "sound"],
];

const PANORAMA_PROPERTIES = PANORAMA_PROPERTY_GROUPS.flat();

const PANORAMA_FUNCTIONS = ["color-stop", "fill-parent-flow", "from", "gaussian", "gradient", "to", "width-percentage"];

const PANORAMA_PSEUDO_CLASSES = ["selected"];

const propertyGroups = [];

for (const [i, group] of recessPropertyGroups.entries()) {
  propertyGroups.push({
    ...group,
    properties: [...group.properties, ...PANORAMA_PROPERTY_GROUPS[i]],
  });
}

module.exports = {
  plugins: ["stylelint-order"],
  extends: ["stylelint-config-standard"],
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    "at-rule-empty-line-before": null,
    "at-rule-no-unknown": [true, { ignoreAtRules: ["define"] }],
    "alpha-value-notation": "number",
    "color-function-notation": "legacy",
    "font-family-no-missing-generic-family-keyword": null,
    "keyframes-name-pattern": "'[\\w-]+'",
    "function-no-unknown": [true, { ignoreFunctions: PANORAMA_FUNCTIONS }],
    "property-no-unknown": [true, { ignoreProperties: PANORAMA_PROPERTIES }],
    "selector-id-pattern": "[a-zA-Z-]+",
    "selector-class-pattern": "[a-zA-Z-]+",
    "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: PANORAMA_PSEUDO_CLASSES }],
    "selector-type-case": ["lower", { ignoreTypes: PANORAMA_TYPES }],
    "selector-type-no-unknown": [true, { ignoreTypes: PANORAMA_TYPES }],
    "value-keyword-case": null,
    "order/properties-order": [propertyGroups, { unspecified: "bottomAlphabetical" }],
  },
};

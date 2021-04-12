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

module.exports = {
  plugins: ["stylelint-order"],
  extends: ["stylelint-config-standard", "stylelint-config-prettier"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["define"],
      },
    ],
    "font-family-no-missing-generic-family-keyword": null,
    "keyframes-name-pattern": "'[a-z-]+'",
    "property-no-unknown": [
      true,
      {
        ignoreProperties: [
          "align",
          "brightness",
          "contrast",
          "flow-children",
          "horizontal-align",
          "hue-rotation",
          "opacity-mask",
          "pre-transform-scale2d",
          "saturation",
          "sound",
          "tooltip-body-position",
          "tooltip-position",
          "wash-color",
        ],
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
    "order/properties-order": [
      [
        {
          properties: ["position", "z-index", "top", "right", "bottom", "left"],
        },
        {
          properties: [
            "display",
            "visibility",
            "float",
            "clear",
            "overflow",
            "overflow-x",
            "overflow-y",
            "clip",
            "zoom",
            "align-content",
            "align-items",
            "align-self",
            "flex",
            "flex-flow",
            "flex-basis",
            "flex-direction",
            "flex-grow",
            "flex-shrink",
            "flex-wrap",
            "justify-content",
            "order",
            "flow-children",
          ],
        },
        {
          properties: [
            "box-sizing",
            "width",
            "min-width",
            "max-width",
            "height",
            "min-height",
            "max-height",
            "margin",
            "margin-top",
            "margin-right",
            "margin-bottom",
            "margin-left",
            "padding",
            "padding-top",
            "padding-right",
            "padding-bottom",
            "padding-left",
          ],
        },
        {
          properties: [
            "align",
            "horizontal-align",
            "vertical-align",
            "pre-transform-scale2d",
            "transform",
            "transform-origin",
          ],
        },
        {
          properties: [
            "table-layout",
            "empty-cells",
            "caption-side",
            "border-spacing",
            "border-collapse",
            "list-style",
            "list-style-position",
            "list-style-type",
            "list-style-image",
          ],
        },
        {
          properties: [
            "content",
            "quotes",
            "counter-reset",
            "counter-increment",
            "resize",
            "cursor",
            "user-select",
            "nav-index",
            "nav-up",
            "nav-right",
            "nav-down",
            "nav-left",
            "tooltip-position",
            "tooltip-body-position",
            "text-align",
            "text-align-last",
            "white-space",
            "text-decoration",
            "text-emphasis",
            "text-emphasis-color",
            "text-emphasis-style",
            "text-emphasis-position",
            "text-indent",
            "text-justify",
            "letter-spacing",
            "word-spacing",
            "text-outline",
            "text-transform",
            "text-wrap",
            "text-overflow",
            "text-overflow-ellipsis",
            "text-overflow-mode",
            "word-wrap",
            "word-break",
            "tab-size",
            "hyphens",
            "pointer-events",
          ],
        },
        {
          properties: [
            "font",
            "font-family",
            "font-size",
            "font-weight",
            "font-style",
            "font-variant",
            "font-size-adjust",
            "font-stretch",
            "font-effect",
            "font-emphasize",
            "font-emphasize-position",
            "font-emphasize-style",
            "font-smooth",
            "line-height",
          ],
        },
        {
          properties: [
            "opacity",
            "opacity-mask",
            "color",
            "wash-color",
            "brightness",
            "contrast",
            "hue-rotation",
            "saturation",
            "outline",
            "outline-width",
            "outline-style",
            "box-decoration-break",
            "box-shadow",
            "text-shadow",
            "border",
            "border-width",
            "border-style",
            "border-color",
            "border-top",
            "border-top-width",
            "border-top-style",
            "border-top-color",
            "border-right",
            "border-right-width",
            "border-right-style",
            "border-right-color",
            "border-bottom",
            "border-bottom-width",
            "border-bottom-style",
            "border-bottom-color",
            "border-left",
            "border-left-width",
            "border-left-style",
            "border-left-color",
            "border-radius",
            "border-top-left-radius",
            "border-top-right-radius",
            "border-bottom-right-radius",
            "border-bottom-left-radius",
            "border-image",
            "border-image-source",
            "border-image-slice",
            "border-image-width",
            "border-image-outset",
            "border-image-repeat",
            "background",
            "background-color",
            "background-image",
            "background-repeat",
            "background-attachment",
            "background-position",
            "background-position-x",
            "background-position-y",
            "background-clip",
            "background-origin",
            "background-size",
          ],
        },
        {
          properties: [
            "transition",
            "transition-delay",
            "transition-timing-function",
            "transition-duration",
            "transition-property",
            "animation",
            "animation-name",
            "animation-duration",
            "animation-play-state",
            "animation-timing-function",
            "animation-delay",
            "animation-iteration-count",
            "animation-direction",
          ],
        },
      ],
      {
        unspecified: "bottomAlphabetical",
      },
    ],
  },
};

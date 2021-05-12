// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    parser: "@typescript-eslint/parser",
    tsconfigRootDir: path.resolve(__dirname, "..", ".."),
    project: "content/panorama/tsconfig.eslint.json",
  },
  plugins: ["prettier", "@typescript-eslint", "import", "simple-import-sort", "vue"],
  settings: {
    "import/parsers": {
      "vue-eslint-parser": [".vue"],
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
  overrides: [
    {
      files: "*.vue",
      rules: {
        // Replicated from https://github.com/typescript-eslint/typescript-eslint/blob/1c1b572c3000d72cfe665b7afbada0ec415e7855/packages/eslint-plugin/src/configs/eslint-recommended.ts
        "constructor-super": "off", // ts(2335) & ts(2377)
        "getter-return": "off", // ts(2378)
        "no-const-assign": "off", // ts(2588)
        "no-dupe-args": "off", // ts(2300)
        "no-dupe-class-members": "off", // ts(2393) & ts(2300)
        "no-dupe-keys": "off", // ts(1117)
        "no-func-assign": "off", // ts(2539)
        "no-import-assign": "off", // ts(2539) & ts(2540)
        "no-new-symbol": "off", // ts(2588)
        "no-obj-calls": "off", // ts(2349)
        "no-redeclare": "off", // ts(2451)
        "no-setter-return": "off", // ts(2408)
        "no-this-before-super": "off", // ts(2376)
        "no-undef": "off", // ts(2304)
        "no-unreachable": "off", // ts(7027)
        "no-unsafe-negation": "off", // ts(2365) & ts(2360) & ts(2358)
        "no-var": "error", // ts transpiles let/const to var, so no need for vars any more
        "prefer-const": "error", // ts provides better types with const
        "prefer-rest-params": "error", // ts provides better types with rest args over arguments
        "prefer-spread": "error", // ts transpiles spread to apply, so no need for manual apply
        "valid-typeof": "off", // ts(2367)
        // False positive on:
        //     import type DefaultExport from "file.vue";
        //     import type { NamedExport } from "file.vue";
        "import/no-duplicates": "off",
      },
    },
  ],
};

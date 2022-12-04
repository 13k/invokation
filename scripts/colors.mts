import { inspect } from "node:util";

import type { ChalkInstance, ColorName, ModifierName } from "chalk";
import chalk from "chalk";
import _ from "lodash";

type ChalkStyleName = ModifierName | ColorName;

export type ColorStyle = ChalkInstance;

export function colorStyle(
  ...styles: (number | [number, number, number] | string | ChalkStyleName)[]
): ColorStyle {
  return _.reduce(
    styles,
    (s, c) => {
      if (_.isArray(c)) {
        return s.rgb(...c);
      }

      if (_.isNumber(c)) {
        return s.ansi256(c);
      }

      if (_.startsWith(c, "#")) {
        return s.hex(c);
      }

      if (c in s) {
        return s[c as ChalkStyleName];
      }

      throw new Error(`Invalid color style: ${inspect(c)}`);
    },
    chalk
  );
}

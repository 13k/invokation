import type { ChalkInstance, ColorName, ModifierName } from "chalk";
import chalk from "chalk";
import _ from "lodash";

type ChalkStyleName = ModifierName | ColorName;

export type ColorStyle = ChalkInstance;

type Style = number | [number, number, number] | string | ChalkStyleName;

export function colorStyle(...styles: Style[]): ColorStyle {
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

      throw new Error(`Invalid color style: ${Bun.inspect(c)}`);
    },
    chalk,
  );
}

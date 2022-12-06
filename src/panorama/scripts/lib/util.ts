/// <reference path="./vendor/lodash.js" />

namespace invk {
  export namespace Util {
    export function prefixer(s: string, prefix: string): string {
      return _.startsWith(s, prefix) ? s : prefix + s;
    }

    export function pascalCase(s: string): string {
      return _.chain(s).camelCase().upperFirst().value();
    }

    type Enum = Record<string | number, string | number>;

    export function parseEnumValue<T extends Enum>(
      enumObj: T,
      value: unknown
    ): T[keyof T] | undefined {
      for (const [k, v] of Object.entries(enumObj)) {
        if (!Number.isNaN(_.toNumber(k))) continue;
        if (v === value) return v as T[keyof T];
      }

      return undefined;
    }
  }
}

/// <reference path="_vendor.ts" />

namespace invk {
  export namespace Util {
    import _ = invk.Vendor.lodash;

    export function randomInt(lower: number, upper: number): number {
      return _.random(lower, upper);
    }

    const uniqueIdCounters: Map<string, number> = new Map();

    export function uniqueId(prefix?: string | undefined): string {
      const key = prefix ?? "";
      let counter = uniqueIdCounters.get(key);

      if (counter == null) {
        counter = 0;
      }

      const id = `${prefix}${counter++}`;

      uniqueIdCounters.set(key, counter);

      return id;
    }

    export function prefixOnce(s: string, prefix: string): string {
      return s.startsWith(prefix) ? s : `${prefix}${s}`;
    }

    export function surround(s: string, left: string, right?: string): string {
      return `${left}${s}${right ?? left}`;
    }

    export function trim(s: string, chars?: string): string {
      return _.trim(s, chars);
    }

    export function capitalize<S extends string>(s: S): Capitalize<S> {
      return _.capitalize(s) as Capitalize<S>;
    }

    export function camelCase(s: string): string {
      return _.camelCase(s);
    }

    export function kebabCase(s: string): string {
      return _.kebabCase(s);
    }

    export function pascalCase(s: string): string {
      return capitalize(camelCase(s));
    }

    export function snakeCase(s: string): string {
      return _.snakeCase(s);
    }

    export function pick<T>(arr: T[], indices: number[]): (T | undefined)[] {
      return _.at(arr, indices);
    }

    export function sortedIndex<T>(arr: T[], val: T): number {
      return _.sortedIndex(arr, val);
    }

    type Enum = Record<string | number, string | number>;

    export function parseEnumValue<T extends Enum>(
      enumObj: T,
      value: unknown,
    ): T[keyof T] | undefined {
      for (const [k, v] of Object.entries(enumObj)) {
        const isStrKey = Number.isNaN(Number.parseInt(k));

        if (isStrKey && v === value) {
          return v as T[keyof T];
        }
      }

      return undefined;
    }
  }
}

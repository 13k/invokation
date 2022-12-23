/// <reference path="./vendor/lodash.js" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Cache {
    const bracketify = (s: string) => `[${s}]`;
    const unbracketify = (s: string) => _.trim(s, "[]");
    const keyPath = (key: string): string[] => _.chain(key).split(".").map(bracketify).value();
    const escapeKey = (key: string) => keyPath(key).join(".");
    const unescapeKey = (key: string) =>
      _.chain(key).split(".").map(unbracketify).join(".").value();

    export class Cache<T> {
      private values: Record<string, T[]> = {};

      private rawSet(key: string, page: T[]) {
        this.values[escapeKey(key)] = page;
      }

      private rawGet(key: string): T[] | undefined {
        return this.values[escapeKey(key)];
      }

      get(key: string): T[] | undefined {
        return this.rawGet(key)?.slice();
      }

      find(value: T): string[] {
        return _.transform(
          this.values,
          (keys, v, k) => {
            if (v.indexOf(value) > -1) {
              keys.push(unescapeKey(k));
            }
          },
          [] as string[],
        );
      }

      siblings(key: string): string[] {
        const path = keyPath(key);
        const prefixPath = path.slice(0, -1);

        if (_.isEmpty(prefixPath)) {
          return [];
        }

        const escKey = escapeKey(key);
        const prefixKey = prefixPath.join(".");

        return _.transform(
          this.values,
          (keys, _v, k) => {
            if (!_.startsWith(k, escKey) && _.startsWith(k, prefixKey)) {
              keys.push(unescapeKey(k));
            }
          },
          [] as string[],
        );
      }

      add(key: string, value: T): T[] {
        let page = this.rawGet(key);

        if (!page) {
          page = [];

          this.rawSet(key, page);
        }

        page.push(value);

        return page;
      }

      remove(key: string, value: T): T[] | undefined {
        const page = this.rawGet(key);

        if (!page) {
          return;
        }

        _.remove(page, (v) => v === value);

        return page.slice();
      }
    }
  }
}

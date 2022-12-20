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

      private set(key: string, page: T[]) {
        key = escapeKey(key);

        this.values[key] = page;
      }

      get(key: string): T[] | undefined {
        key = escapeKey(key);

        return this.values[key];
      }

      find(value: T): string[] {
        return _.transform(
          this.values,
          (keys, v, k) => {
            if (v.indexOf(value) > -1) {
              keys.push(k);
            }
          },
          [] as string[]
        );
      }

      siblings(key: string): string[] {
        const path = keyPath(key);
        const selfID = path.pop();

        if (_.isEmpty(path) || !selfID) {
          return [];
        }

        const prefixKey = path.join(".");
        const prefixEscKey = escapeKey(prefixKey);

        return _.transform(
          this.values,
          (keys, _v, k) => {
            if (_.startsWith(k, prefixEscKey)) {
              keys.push(unescapeKey(k));
            }
          },
          [] as string[]
        );
      }

      add(key: string, value: T): T[] {
        let page = this.get(key);

        if (!page) {
          page = [];

          this.set(key, page);
        }

        page.push(value);

        return page;
      }

      remove(key: string, value: T): T[] | undefined {
        const page = this.get(key);

        if (!page) {
          return;
        }

        return _.remove(page, (v) => v === value);
      }
    }
  }
}

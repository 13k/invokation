const { lodash: _ } = CustomUIConfig;

function bracketify(s: string) {
  return `[${s}]`;
}

function unbracketify(s: string) {
  return _.trim(s, "[]");
}

function keyPath(key: string): string[] {
  return _.chain(key).split(".").map(bracketify).value();
}

function escapeKey(key: string) {
  return keyPath(key).join(".");
}

function unescapeKey(key: string) {
  return _.chain(key).split(".").map(unbracketify).join(".").value();
}

class Cache<T> {
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

export type { Cache };

CustomUIConfig.Cache = Cache;

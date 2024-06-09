import trim from "lodash-es/trim";

import { surround } from "./util/surround";

const PATH_SEP = ".";

const bracketify = (s: string) => surround(s, "[", "]");
const unbracketify = (s: string) => trim(s, "[]");
const keyPath = (key: string): string[] => key.split(PATH_SEP).map(bracketify);
const escapeKey = (key: string) => keyPath(key).join(PATH_SEP);
const unescapeKey = (key: string) => key.split(PATH_SEP).map(unbracketify).join(PATH_SEP);

export class Cache<T> {
  #values: Map<string, T[]> = new Map();

  #set(key: string, page: T[]) {
    this.#values.set(escapeKey(key), page);
  }

  #get(key: string): T[] | undefined {
    return this.#values.get(escapeKey(key));
  }

  #getOrCreate(key: string): T[] {
    let page = this.#get(key);

    if (page == null) {
      page = [];
      this.#set(key, page);
    }

    return page;
  }

  get(key: string): T[] | undefined {
    return this.#get(key)?.slice();
  }

  find(value: T): string[] {
    const keys: string[] = [];

    for (const [k, v] of this.#values.entries()) {
      if (v.indexOf(value) > -1) {
        keys.push(unescapeKey(k));
      }
    }

    return keys;
  }

  siblings(key: string): string[] {
    const path = keyPath(key);
    const prefixPath = path.slice(0, -1);

    if (prefixPath.length === 0) {
      return [];
    }

    const escKey = escapeKey(key);
    const prefixKey = prefixPath.join(".");
    const keys: string[] = [];

    for (const key of this.#values.keys()) {
      if (!key.startsWith(escKey) && key.startsWith(prefixKey)) {
        keys.push(unescapeKey(key));
      }
    }

    return keys;
  }

  add(key: string, value: T): T[] {
    const page = this.#getOrCreate(key);

    page.push(value);

    return page;
  }

  remove(key: string, value: T): T[] | undefined {
    let page = this.#get(key);

    if (page == null) {
      return undefined;
    }

    page = page.filter((v) => v !== value);

    this.#set(key, page);

    return page.slice();
  }
}

import { get, setWith } from "lodash";

const storageSymbol = Symbol("DeepMapStorage");

interface DeepMapStorage<T> {
  [storageSymbol]: void;
  [key: string]: T | DeepMapStorage<T>;
}

const createStorage = <T>(): DeepMapStorage<T> => ({} as DeepMapStorage<T>);

const isStorage = <T>(value: T | DeepMapStorage<T>): value is DeepMapStorage<T> =>
  storageSymbol in value;

const storageKey = (path: string): string =>
  path
    .split(".")
    .map((seg) => `[${seg}]`)
    .join(".");

export class DeepMap<T> {
  #storage: DeepMapStorage<T>;

  constructor() {
    this.#storage = createStorage<T>();
  }

  get(path: string): T | undefined {
    const key = storageKey(path);
    const value = get<DeepMapStorage<T>, string, undefined>(this.#storage, key, undefined);

    if (value === undefined) {
      return value;
    }

    if (isStorage(value)) {
      throw new Error(`Invalid path ${key}`);
    }

    return value;
  }

  // TODO: implement
  getSiblings(path: string): T[] | undefined {
    return undefined;
  }

  set(path: string, value: T): T {
    const key = storageKey(path);

    setWith(this.#storage, key, value, createStorage);

    return value;
  }
}

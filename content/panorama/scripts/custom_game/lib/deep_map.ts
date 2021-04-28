import { get, setWith, transform } from "lodash";

const storageSymbol = Symbol("DeepMapStorage");

interface DeepMapStorage<T> {
  [storageSymbol]: void;
  [key: string]: T | DeepMapStorage<T>;
}

const createStorage = <T>(): DeepMapStorage<T> => ({ [storageSymbol]: undefined });

const isStorage = <T>(value: T | DeepMapStorage<T>): value is DeepMapStorage<T> =>
  storageSymbol in value;

const storageKeySplit = (path: string): string[] => path.split(".").map((seg) => `[${seg}]`);
const storageKeyJoin = (atoms: string[]): string => atoms.join(".");
const storageKey = (path: string): string => storageKeyJoin(storageKeySplit(path));

export class DeepMap<T> {
  #storage: DeepMapStorage<T>;

  constructor() {
    this.#storage = createStorage<T>();
  }

  get(path: string): T | undefined {
    const key = storageKey(path);
    const value = get<DeepMapStorage<T>, string, undefined>(this.#storage, key, undefined);

    if (value === undefined) {
      return undefined;
    }

    if (isStorage(value)) {
      throw new Error(`Invalid path ${key}`);
    }

    return value;
  }

  getSiblings(path: string): { [path: string]: T } {
    const pathAtoms = storageKeySplit(path);
    const lastPathAtom = pathAtoms.pop();
    const parentPathAtoms = pathAtoms;
    const parentPath = storageKeyJoin(pathAtoms);
    const parentStorage = get<DeepMapStorage<T>, string, undefined>(
      this.#storage,
      parentPath,
      undefined
    );

    if (parentStorage === undefined) {
      return {};
    }

    if (!isStorage(parentStorage)) {
      return {};
    }

    return transform(
      parentStorage,
      (subs, element, pathAtom) => {
        if (!isStorage(element) && pathAtom !== lastPathAtom) {
          const subPath = storageKeyJoin([...parentPathAtoms, pathAtom]);
          subs[subPath] = element;
        }
      },
      {} as { [path: string]: T }
    );
  }

  set(path: string, value: T): T {
    const key = storageKey(path);

    setWith(this.#storage, key, value, createStorage);

    return value;
  }
}

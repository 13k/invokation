export type LuaArray<T> = { [key: number]: T };

export function fromArray<T>(value: LuaArray<T>): T[] {
  const arr: T[] = [];

  for (const [k, v] of Object.entries(value)) {
    const i = Number.parseInt(k);

    if (i > 0) {
      arr[i - 1] = v;
    }
  }

  return arr;
}

export function indexArray(obj: LuaArray<number>): number[] {
  return fromArray(obj).map((i) => i - 1);
}

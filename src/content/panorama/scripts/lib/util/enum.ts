type Enum = Record<string | number, string | number>;

export function parseEnumValue<T extends Enum>(enumObj: T, value: unknown): T[keyof T] | undefined {
  for (const [k, v] of Object.entries(enumObj)) {
    const isStrKey = Number.isNaN(Number.parseInt(k, 10));

    if (isStrKey && v === value) {
      return v as T[keyof T];
    }
  }

  return undefined;
}

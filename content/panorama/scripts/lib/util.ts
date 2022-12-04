const { lodash: _ } = CustomUIConfig;

function prefixer(s: string, prefix: string): string {
  return _.startsWith(s, prefix) ? s : prefix + s;
}

function pascalCase(s: string): string {
  return _.chain(s).camelCase().upperFirst().value();
}

function parseEnumValue<T extends Record<string | number, string | number>>(
  enumObj: T,
  value: unknown
): T[keyof T] | undefined {
  for (const [k, v] of Object.entries(enumObj)) {
    if (!Number.isNaN(_.toNumber(k))) continue;
    if (v === value) return v as T[keyof T];
  }
}

const module = {
  prefixer,
  pascalCase,
  parseEnumValue,
};

export type Util = typeof module;

CustomUIConfig.Util = module;

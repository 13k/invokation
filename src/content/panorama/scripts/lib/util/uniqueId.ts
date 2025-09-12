declare global {
  interface CustomUIConfig {
    // biome-ignore lint/style/useNamingConvention: constant
    UNIQUE_IDS: Map<string, number>;
  }
}

const CACHE = (() => {
  GameUI.CustomUIConfig().UNIQUE_IDS ??= new Map();

  return GameUI.CustomUIConfig().UNIQUE_IDS;
})();

export function uniqueId(prefix?: string | undefined): string {
  const key = prefix ?? "";
  let counter = CACHE.get(key);

  if (counter == null) {
    counter = 0;
  }

  const id = `${prefix}${counter++}`;

  CACHE.set(key, counter);

  return id;
}

const uniqueIdCounters: Map<string, number> = new Map();

export function uniqueId(prefix?: string | undefined): string {
  const key = prefix ?? "";
  let counter = uniqueIdCounters.get(key);

  if (counter == null) {
    counter = 0;
  }

  const id = `${prefix}${counter++}`;

  uniqueIdCounters.set(key, counter);

  return id;
}

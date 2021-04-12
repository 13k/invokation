import { hasOwnEnumerableProperty, hasOwnProperty } from "./object";

// eslint-disable-next-line @typescript-eslint/ban-types
function hasSequenceLengthProperty<T extends {}>(obj: T): obj is T & Record<"n", number> {
  if (!hasOwnEnumerableProperty(obj, "n")) {
    return false;
  }

  return typeof obj.n === "number";
}

// eslint-disable-next-line @typescript-eslint/ban-types
function sequenceLengthFromIndices<T extends {}>(obj: T): number {
  const numericKeys = Object.keys(obj)
    .map((k) => parseInt(k))
    .filter((n) => !isNaN(n));

  if (numericKeys.length === 0) {
    return -1;
  }

  const maxIdx = numericKeys.reduce((a, b) => Math.max(a, b));

  return maxIdx < 1 ? -1 : maxIdx;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function sequenceLength<T extends {}>(obj: T): number {
  if (hasSequenceLengthProperty(obj)) {
    return obj.n;
  }

  return sequenceLengthFromIndices(obj);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function hasSequenceIndices<T extends {}>(obj: T, length: number): boolean {
  for (let i = 1; i <= length; i++) {
    if (!hasOwnEnumerableProperty(obj, i)) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if the given object is a Lua sequence representation.
 *
 * Lua sequences are defined here: {@link https://www.lua.org/manual/5.4/manual.html#3.4.7}.
 */
export function isSequence<Item>(obj: unknown): obj is invk.Lua.Sequence<Item> {
  // TODO(perf): optimize multiple iterations over object.

  if (typeof obj !== "object") {
    return false;
  }

  if (obj == null) {
    return false;
  }

  // reject array-like objects
  if (hasOwnProperty(obj, "length")) {
    return false;
  }

  // handle special n-length case first
  if (hasSequenceLengthProperty(obj)) {
    return obj.n >= 0 && hasSequenceIndices(obj, obj.n);
  }

  // reject zero-based index
  if (hasOwnEnumerableProperty(obj, 0)) {
    return false;
  }

  const length = sequenceLengthFromIndices(obj);

  return length >= 0 && hasSequenceIndices(obj, length);
}

type FromSequenceItem<T> = T extends invk.Lua.Sequence<infer Item> ? Item : unknown;
type FromSequenceResult<T, Item> = T extends invk.Lua.Sequence<Item> ? Item[] : null;

/**
 * Similar to `Array.from`, attempts to create an `Array` instance from an object representation of
 * a Lua sequence (see {@link isLuaSeq}).
 *
 * Besides regular sequences (a table with numeric `{1..n}` indices), the conventional case where
 * the Lua sequence contains a `"n"` key as the length of the sequence is also handled.
 *
 * The returned array maintains the same length as the Lua array, shifting the indices by -1
 * (starts at 0).
 *
 * @returns {T[] | null} `null` if obj is not a Lua sequence, otherwise an array of T.
 */
export function fromSequence<T, Item = FromSequenceItem<T>>(obj: T): FromSequenceResult<T, Item> {
  // TODO(perf): optimize multiple iterations over object.

  if (!isSequence<Item>(obj)) {
    return null as FromSequenceResult<T, Item>;
  }

  const length = sequenceLength(obj) + 1;
  const aryLike = { ...obj, length };

  return Array.from<Item>(aryLike).slice(1) as FromSequenceResult<T, Item>;
}

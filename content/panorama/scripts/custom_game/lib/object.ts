// eslint-disable-next-line @typescript-eslint/ban-types
export function hasOwnProperty<T extends {}, P extends PropertyKey>(
  obj: T,
  prop: P
): obj is T & Record<P, unknown> {
  return Object.hasOwnProperty.call(obj, prop);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function hasOwnEnumerableProperty<T extends {}, P extends PropertyKey>(
  obj: T,
  prop: P
): obj is T & Record<P, unknown> {
  return Object.propertyIsEnumerable.call(obj, prop);
}

/*
export const flattenObject = (
  object: any,
  path: string[] = [],
  fn: (v: any) => any = identity
): { [k: string]: any } => {
  const result: { [k: string]: any } = {};

  Object.entries(object).forEach(([key, value]) => {
    const subPath = [...path, key];
    const fullKey = subPath.join(".");

    if (isPlainObject(value)) {
      Object.assign(result, flattenObject(value, subPath, fn));
    } else {
      result[fullKey] = fn(value);
    }
  });

  return result;
};
*/

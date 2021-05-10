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

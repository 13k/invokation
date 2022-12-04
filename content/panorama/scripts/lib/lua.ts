const { lodash: _ } = CustomUIConfig;

type ArrayUpper<T extends object> = T extends
  | Function // eslint-disable-line @typescript-eslint/ban-types
  | unknown[]
  ? never
  : { [K in keyof T as K extends number ? K : never]: T[K] };

export type LuaArray<T> = object & Record<number, T>;

export type FromLuaArray<T> = T extends
  | undefined
  | null
  | boolean
  | bigint
  | number
  | string
  | symbol
  | Function // eslint-disable-line @typescript-eslint/ban-types
  ? T
  : T extends (infer I)[]
  ? FromLuaArray<I>[]
  : T extends object
  ? ArrayUpper<T> extends T
    ? FromLuaArray<T[keyof T]>[]
    : { [K in keyof T as K]: FromLuaArray<T[K]> }
  : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isArray<T>(value: any): value is LuaArray<T> {
  if (!_.isPlainObject(value)) {
    return false;
  }

  return _.chain(value)
    .keys()
    .every((k) => _.isInteger(_.toNumber(k)))
    .value();
}

function fromArray<Item>(value: LuaArray<Item>): Item[];
function fromArray<ItemIn, ItemOut = ItemIn>(
  value: LuaArray<ItemIn>,
  map?: (value: ItemIn) => ItemOut
): ItemOut[];
function fromArray<T, ItemIn, ItemOut = ItemIn>(
  value: T | LuaArray<ItemIn>,
  map: (value: ItemIn) => ItemOut = _.identity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any | ItemOut[] {
  if (!isArray<ItemIn>(value)) {
    return value;
  }

  return _.transform(
    value,
    (arr, v, k) => {
      arr[_.toNumber(k) - 1] = map(v);
    },
    [] as ItemOut[]
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromArrayDeep(value: any): any {
  if (typeof value !== "object" || value == null) {
    return value;
  }

  if (_.isArray(value)) {
    return _.map(value, fromArrayDeep);
  }

  if (isArray(value)) {
    return fromArray(value, fromArrayDeep);
  }

  if (_.isPlainObject(value)) {
    return _.mapValues(value, fromArrayDeep);
  }

  return value;
}

function indexArray(obj: LuaArray<number>): number[] {
  return fromArray(obj, (i) => i - 1);
}

const module = {
  isArray,
  fromArray,
  fromArrayDeep,
  indexArray,
};

export type Lua = typeof module;

CustomUIConfig.Lua = module;

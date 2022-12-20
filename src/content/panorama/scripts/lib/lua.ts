/// <reference path="./vendor/lodash.js" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Lua {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type ArrayUpperBound<T extends object> = T extends ((...args: any) => any) | unknown[]
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
      | ((...args: any) => any) // eslint-disable-line @typescript-eslint/no-explicit-any
      ? T
      : T extends (infer I)[]
      ? FromLuaArray<I>[]
      : T extends object
      ? ArrayUpperBound<T> extends T
        ? FromLuaArray<T[keyof T]>[]
        : { [K in keyof T as K]: FromLuaArray<T[K]> }
      : T;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function isArray<T>(value: any): value is LuaArray<T> {
      if (!_.isPlainObject(value)) {
        return false;
      }

      return _.chain(value)
        .keys()
        .every((k) => _.isInteger(_.toNumber(k)))
        .value();
    }

    export function fromArray(
      value: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      map: (value: any) => any = _.identity // eslint-disable-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): any {
      if (!isArray(value)) {
        return value;
      }

      return _.transform(
        value,
        (arr, v, k) => {
          arr[_.toNumber(k) - 1] = map(v);
        },
        [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function fromArrayDeep(value: any): any {
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

    export function indexArray(obj: LuaArray<number>): number[] {
      return fromArray(obj, (i) => i - 1);
    }
  }
}

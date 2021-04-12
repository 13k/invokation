// https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? A
  : B;

type OmitReadonly<T> = {
  [K in keyof T as IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K, never>]: T[K];
};

type FunctionPropertyNames<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type OmitFunction<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

type PickFunction<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

type PickMethod<T> = PickFunction<T>;

type Writable<T> = OmitFunction<OmitReadonly<T>>;

// eslint-disable-next-line @typescript-eslint/ban-types
type IsFunctionProperty<T, K extends keyof T> = { [Key in K]: T[K] & ((...args: any) => any) };
type IsNumericProperty<T, K extends keyof T> = { [Key in K]: number };

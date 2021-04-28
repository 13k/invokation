// https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? A
  : B;

type OmitReadonly<T> = {
  [K in keyof T as IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K, never>]: T[K];
};

type OmitFunction<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

type PickFunction<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

type MethodMapping<T> = Record<string, keyof T & keyof PickFunction<T>>;

type MethodBinding<T, M extends MethodMapping<T>> = {
  [K in keyof M]: T[M[K]];
};

type HasMethods<T, M extends MethodMapping<T>> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof M as T[M[K]] extends Function ? M[K] : never]: T[M[K]] & Function;
};

type Writable<T> = OmitFunction<OmitReadonly<T>>;

type IsNumericProperty<T, K extends keyof T> = { [Key in K]: number };

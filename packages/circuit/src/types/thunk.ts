export type Thunk<T> = T | (() => T);

export type UnwrapThunk<T> = T extends Thunk<infer U> ? U : T;

export const unwrapThunk = <T>(value: Thunk<T>): T => {
  return typeof value === 'function' ? (value as any)() : value;
};

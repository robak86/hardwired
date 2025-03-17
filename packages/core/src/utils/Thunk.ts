export type Thunk<T> = T | (() => T);

export type UnwrapThunk<T> = T extends Thunk<infer U> ? U : T;

export const unwrapThunk = <T>(thunk: Thunk<T>): T => {
  if (thunk instanceof Function) {
    return thunk();
  }

  return thunk;
};

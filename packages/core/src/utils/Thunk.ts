export type Thunk<T> = T | (() => T);

export const unwrapThunk = <T>(thunk: Thunk<T>): T => {
  if (thunk instanceof Function) {
    return thunk();
  }

  return thunk;
};

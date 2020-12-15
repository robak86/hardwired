export type Thunk<T> = T | (() => T);

// TODO: add unwrap safe - it compares returned values across calls and make sure that thunk returns always the same value
export const unwrapThunk = <T>(thunk: Thunk<T>): T => {
  if (thunk instanceof Function) {
    return thunk();
  }

  return thunk;
};

export type Thunk<T> = T | (() => T)

export function unwrapThunk<T>(thunk:Thunk<T>):T {
    return thunk instanceof Function ? thunk() : thunk;
}
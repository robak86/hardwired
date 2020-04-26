export type Thunk<T> = T | (() => T)
export type UnwrapThunk<T> = T extends Thunk<infer INNER> ? INNER : T;

export function unwrapThunk<T>(thunk:Thunk<T>):T {
    return thunk instanceof Function ? thunk() : thunk;
}
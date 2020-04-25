

export type Mapped<T, N> = {
    [K in keyof T]:N;
}

export type UnwrapPromise<T extends Promise<any>> =
    T extends Promise<infer IT> ? IT : never;
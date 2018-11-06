export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export type Mapped<T, N> = {
    [K in keyof T]:N;
}
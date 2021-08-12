// prettier-ignore
export type PropType<T, Path> =
    string extends Path ? unknown :
    Path extends keyof T ? T[Path] :
    Path extends `${infer K}.${infer R}` ?
        (K extends keyof T ? PropType<T[K], R> : unknown)
            : unknown;

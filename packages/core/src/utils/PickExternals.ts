export type IsNever<T> = [T] extends [never] ? true : false;
export type NeverToVoid<T> = IsNever<T> extends true ? void : T;

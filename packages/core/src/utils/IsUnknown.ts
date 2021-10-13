export type IsAny<T> = 0 extends 1 & T ? true : false; // https://stackoverflow.com/a/49928360/3406963
export type IsNever<T> = [T] extends [never] ? true : false;
export type IsUnknown<T> = IsNever<T> extends false
  ? T extends unknown
    ? unknown extends T
      ? IsAny<T> extends false
        ? true
        : false
      : false
    : false
  : false;


export type UnknownToNever<T> =
    unknown extends T ? never:
    void extends T ? never :
        T;

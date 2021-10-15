export type IsFinite<Tuple, Finite, Infinite> = Tuple extends []
  ? Finite
  : Tuple extends Array<infer Element>
    ? Element[] extends Tuple
      ? Infinite
      : Tuple extends [any, ...infer Rest]
        ? IsFinite<Rest, Finite, Infinite>
        : never
    : never;

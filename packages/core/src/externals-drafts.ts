export type MyType = [1, 2];

// type Concat<T1 extends any[], T2 extends any[]> = [...T1, ...T2]

// type Concat<T> = T extends [infer A, ...infer Rest]
//   ? A extends any[] ? [...A, ...Concat<Rest>] : A
//   : T;

// type C = Concat<[T1, T2, TN]>;

type ConcatUnique<T1, T2> = [];

// type C1 = [1][number] extends [1, 2][number] ? true : false;
type Contains<TItem, TArr extends any[]> = TItem extends TArr[number] ? true : false;

type Z = Contains<0, [1, 2]>;

// prettier-ignore
// type Concat<T, TConcatenated> =
//   [] extends TConcatenated ? TConcatenated:
//   T extends [infer A, ...infer Rest] ? A extends any[] ? [...A, ...Concat<Rest>] : A
//   : T;

type AppendUnique<TItem, TCollection extends any[]> = Contains<TItem, TCollection> extends false
  ? [...TCollection, TItem]
  : TCollection;

type Merge<T1 extends any[], T2 extends any[]> = MergeUnique<T2, T1, MergeUnique<T1, T2, []>>;

type MergeUnique<T1 extends any[], T2 extends any[], TResult extends any[]> = T1 extends [
  infer TCurrentItem,
  ...infer TRest
]
  ? MergeUnique<TRest, T2, AppendUnique<TCurrentItem, TResult>>
  : TResult;

type Cc = Merge<[1, 2], [1, 2, 3, 4]>;

type C = Merge<[{ item: 1 }], [{ item: 1 }, { item: 2 }]>;

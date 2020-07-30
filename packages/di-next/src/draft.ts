export type Item<TKey extends string, TValue> = {
  key: TKey;
  value: TValue;
};

type ItemRecord<T> = T extends Item<infer TKey, infer TValue> ? Record<TKey, TValue> : any;

const item = <TKey extends string, TValue>(key: TKey, value: TValue): Item<TKey, TValue> => {
  return null as any;
};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type ItemsRecords<T extends Array<(...args: any[]) => Item<any, any>>> = UnionToIntersection<
  ItemRecord<ReturnType<T[number]>>
>;

type AnyItem = Item<any, any>;

type Compose = {
  <
    T1 extends (ctx: {}) => AnyItem, //breakme
    T2 extends (ctx: ItemRecord<ReturnType<T1>>) => AnyItem
  >(
    params: [T1, T2],
  ): ItemsRecords<[T1, T2]>;
  <
    T1 extends (ctx: {}) => AnyItem, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyItem,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyItem
  >(
    ...params: [T1, T2, T3?]
  ): ItemsRecords<[T1, T2, T3]>;

  <
    T1 extends (ctx: {}) => AnyItem, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyItem,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyItem,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyItem
  >(
    ...params: [T1, T2, T3, T4]
  ): ItemsRecords<[T1, T2, T3, T4]>;

  <
    T1 extends (ctx: {}) => AnyItem, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyItem,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyItem,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyItem,
    T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyItem
  >(
    ...params: [T1, T2, T3, T4, T5]
  ): ItemsRecords<[T1, T2, T3, T4, T5]>;

  <
    T1 extends (ctx: {}) => AnyItem, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyItem,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyItem,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyItem,
    T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyItem,
    T6 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5]>) => AnyItem
  >(
    ...params: [T1, T2, T3, T4, T5, T6]
  ): ItemsRecords<[T1, T2, T3, T4, T5, T6]>;

  <
    T1 extends (ctx: {}) => AnyItem, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyItem,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyItem,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyItem,
    T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyItem,
    T6 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5]>) => AnyItem,
    T7 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5, T6]>) => AnyItem
  >(
    ...params: [T1, T2, T3, T4, T5, T6, T7]
  ): ItemsRecords<[T1, T2, T3, T4, T5, T6, T7]>;
};

const composeReverse: Compose = (...args: any[]) => {
  return null as any;
};

const composed = composeReverse(
  _ => item('entry1', 123), //breakme
  _ => item('entry2', _.entry1),
  _ => item('entry3', _.entry2),
  _ => item('entry4', _.entry2),
  _ => item('entry5', _.entry2),
);

const composed2 = composeReverse(
    _ => item('entry1', composed), //breakme
    _ => item('entry2', composed),
    _ => item('entry3', _.entry2),
    // _ => item('entry4', _.entry),
    _ => item('entry5', _.entry2),
);
/*
  .replace(
    _ => item('entry5', _.entry2),
  )

 */

composed2.entry1.entry1;

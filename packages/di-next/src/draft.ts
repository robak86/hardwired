import { DependencyResolver } from "./resolvers/DependencyResolver";

export type ItemRecord<T> = T extends DependencyResolver<infer TKey, infer TValue> ? Record<TKey, TValue> : any;

const item = <TKey extends string, TValue>(key: TKey, value: TValue): DependencyResolver<TKey, TValue> => {
  return null as any;
};

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type ItemsRecords<T extends Array<(...args: any[]) => DependencyResolver<any, any>>> = UnionToIntersection<
  ItemRecord<ReturnType<T[number]>>
>;

export type AnyDependencyResolver = DependencyResolver<any, any>;

export type ComposeDependencyResolvers = {
  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemRecord<ReturnType<T1>>) => AnyDependencyResolver
  >(
    params: [T1, T2],
  ): ItemsRecords<[T1, T2]>;
  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver
  >(
    ...params: [T1, T2, T3?]
  ): ItemsRecords<[T1, T2, T3]>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver
  >(
    ...params: [T1, T2, T3, T4]
  ): ItemsRecords<[T1, T2, T3, T4]>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver,
    T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyDependencyResolver
  >(
    ...params: [T1, T2, T3, T4, T5]
  ): ItemsRecords<[T1, T2, T3, T4, T5]>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver,
    T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyDependencyResolver,
    T6 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5]>) => AnyDependencyResolver
  >(
    ...params: [T1, T2, T3, T4, T5, T6]
  ): ItemsRecords<[T1, T2, T3, T4, T5, T6]>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver,
    T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyDependencyResolver,
    T6 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5]>) => AnyDependencyResolver,
    T7 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5, T6]>) => AnyDependencyResolver
  >(
    ...params: [T1, T2, T3, T4, T5, T6, T7]
  ): ItemsRecords<[T1, T2, T3, T4, T5, T6, T7]>;
};

const composeReverse: ComposeDependencyResolvers = (...args: any[]) => {
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

composed2.entry2;
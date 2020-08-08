import { ModuleBuilder } from './ModuleBuilder';
import { DependencyFactory } from '../draft';

import {
  AbstractDependencyResolver,
  AbstractRegistryDependencyResolver,
} from '../resolvers/AbstractDependencyResolver';

export type DependencyResolver<TValue = any> = { value: TValue };

// prettier-ignore
export type ItemFactory<T> =
  T extends AbstractRegistryDependencyResolver<infer TKey, infer TValue> ? Record<TKey, TValue> :
    T extends AbstractDependencyResolver<infer TKey, infer TValue> ? Record<TKey, DependencyFactory<TValue>> : never

// export type ItemFactory<T> = T extends DependencyResolver<infer TKey, infer TValue>
//   ? Record<TKey, (cache: ContainerCache) => TValue>
//   : any;

type ModuleEntry<TKey, TValue, TContext> = [TKey, (ctx: TContext) => DependencyResolver<TValue>];
type ModuleEntryKey<T extends ModuleEntry<any, any, any>> = T extends ModuleEntry<infer TKey, any, any> ? TKey : never;
type ModuleEntryValue<T extends ModuleEntry<any, any, any>> = T extends ModuleEntry<any, infer TValue, any>
  ? TValue
  : never;

const item = <TKey extends string, TValue>(key: TKey, value: TValue): [TKey, DependencyResolver<TValue>] => {
  return null as any;
};

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type ItemRecord<T extends ModuleEntry<any, any, any>> = {
  [K in keyof ModuleEntryKey<T>]: ModuleEntryValue<T>;
};

export type ItemsRecords<T extends Array<ModuleEntry<any, any, any>>> = UnionToIntersection<ItemRecord<T[number]>>;

export type ComposeDependencyResolvers<TPrev> = {
  <
    T1Key extends string, //breakme
    T1 extends (ctx: {}) => DependencyResolver<any>
  >(
    ...deps: [[T1Key, T1]]
  ): [T1Key, ReturnType<T1>];

  // <
  //   T1 extends ModuleEntry<any, any, any>, //breakme
  //   T2 extends ModuleEntry<any, any, ItemsRecords<T1>>
  // >(
  //   ...deps: [T1, T2]
  // ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2]>>;

  // <
  //   T1 extends (ctx: {}) => DependencyResolver<any>, //breakme
  //   T2 extends (ctx: ItemsRecords<[T1]>) => DependencyResolver<any>,
  //   T3 extends (ctx: ItemsRecords<[T1, T2]>) => DependencyResolver<any>
  // >(
  //   ...deps: [T1, T2, T3?]
  // ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3]>>;
  //
  // <
  //   T1 extends (ctx: {}) => DependencyResolver<any>, //breakme
  //   T2 extends (ctx: ItemsRecords<[T1]>) => DependencyResolver<any>,
  //   T3 extends (ctx: ItemsRecords<[T1, T2]>) => DependencyResolver<any>,
  //   T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => DependencyResolver<any>
  // >(
  //   ...deps: [T1, T2, T3, T4]
  // ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4]>>;
  //
  // <
  //   T1 extends (ctx: {}) => DependencyResolver<any>, //breakme
  //   T2 extends (ctx: ItemsRecords<[T1]>) => DependencyResolver<any>,
  //   T3 extends (ctx: ItemsRecords<[T1, T2]>) => DependencyResolver<any>,
  //   T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => DependencyResolver<any>,
  //   T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => DependencyResolver<any>
  // >(
  //   ...deps: [T1, T2, T3, T4, T5]
  // ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4, T5]>>;
  //
  // <
  //   T1 extends (ctx: {}) => DependencyResolver< any>, //breakme
  //   T2 extends (ctx: ItemsRecords<[T1]>) => DependencyResolver< any>,
  //   T3 extends (ctx: ItemsRecords<[T1, T2]>) => DependencyResolver< any>,
  //   T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => DependencyResolver< any>,
  //   T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => DependencyResolver< any>,
  //   T6 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5]>) => DependencyResolver< any>
  // >(
  //   ...deps: [T1, T2, T3, T4, T5, T6]
  // ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4, T5, T6]>>;
  //
  // <
  //   T1 extends (ctx: {}) => DependencyResolver< any>, //breakme
  //   T2 extends (ctx: ItemsRecords<[T1]>) => DependencyResolver< any>,
  //   T3 extends (ctx: ItemsRecords<[T1, T2]>) => DependencyResolver< any>,
  //   T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => DependencyResolver< any>,
  //   T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => DependencyResolver< any>,
  //   T6 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5]>) => DependencyResolver< any>,
  //   T7 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5, T6]>) => DependencyResolver< any>
  // >(
  //   ...deps: [T1, T2, T3, T4, T5, T6, T7]
  // ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4, T5, T6, T7]>>;
};

const compose: ComposeDependencyResolvers<any> = null as any;

const dependency = <TValue>(value: TValue): DependencyResolver<TValue> => {
  throw new Error('implement me');
};
//
// const entry = <TKey extends string, TValue>(
//   key: TKey,
//   factory: (ctx) => DependencyResolver<TValue>,
// ): ModuleEntry<TKey, TValue, any> => {
//   throw new Error('implement me');
// };
//
// // const a = compose(['a', use => dependency(1)]);
// const entry1 = entry('a', ctx => dependency(1));
const a = compose(['a', ctx => dependency(1)]);

const z:null = a[0]

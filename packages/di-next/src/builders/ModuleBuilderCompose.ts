import { AnyDependencyResolver, ItemRecord, ItemsRecords } from '../draft';
import { ModuleBuilder } from './ModuleBuilder';

export type ComposeDependencyResolvers<TPrev> = {
  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemRecord<ReturnType<T1>>) => AnyDependencyResolver
  >(
    ...params: [T1, T2]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2]>>;
  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver
  >(
    ...params: [T1, T2, T3?]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3]>>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver
  >(
    ...params: [T1, T2, T3, T4]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4]>>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver,
    T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyDependencyResolver
  >(
    ...params: [T1, T2, T3, T4, T5]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4, T5]>>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver,
    T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyDependencyResolver,
    T6 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5]>) => AnyDependencyResolver
  >(
    ...params: [T1, T2, T3, T4, T5, T6]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4, T5, T6]>>;

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
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4, T5, T6, T7]>>;
};

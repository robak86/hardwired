import { ModuleBuilder } from './ModuleBuilder';
import { AnyDependencyResolver, ItemFactory, ItemsRecords } from '../draft';

export type ComposeDependencyResolvers<TPrev> = {
  <
    T1 extends (ctx: {}) => AnyDependencyResolver //breakme
  >(
    ...deps: [T1]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1]>>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemFactory<ReturnType<T1>>) => AnyDependencyResolver
  >(
    ...deps: [T1, T2]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2]>>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver
  >(
    ...deps: [T1, T2, T3?]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3]>>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver
  >(
    ...deps: [T1, T2, T3, T4]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4]>>;

  <
    T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver,
    T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyDependencyResolver
  >(
    ...deps: [T1, T2, T3, T4, T5]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4, T5]>>;
  //
  // <
  //   T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
  //   T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
  //   T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
  //   T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver,
  //   T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyDependencyResolver,
  //   T6 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5]>) => AnyDependencyResolver
  // >(
  //   ...deps: [T1, T2, T3, T4, T5, T6]
  // ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4, T5, T6]>>;
  //
  // <
  //   T1 extends (ctx: {}) => AnyDependencyResolver, //breakme
  //   T2 extends (ctx: ItemsRecords<[T1]>) => AnyDependencyResolver,
  //   T3 extends (ctx: ItemsRecords<[T1, T2]>) => AnyDependencyResolver,
  //   T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => AnyDependencyResolver,
  //   T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => AnyDependencyResolver,
  //   T6 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5]>) => AnyDependencyResolver,
  //   T7 extends (ctx: ItemsRecords<[T1, T2, T3, T4, T5, T6]>) => AnyDependencyResolver
  // >(
  //   ...deps: [T1, T2, T3, T4, T5, T6, T7]
  // ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4, T5, T6, T7]>>;
};

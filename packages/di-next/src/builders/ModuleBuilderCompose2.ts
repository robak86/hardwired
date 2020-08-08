import { ModuleBuilder } from './ModuleBuilder';
import { ItemFactory, ItemsRecords } from '../draft';

import {
  AbstractDependencyResolver,
  AbstractRegistryDependencyResolver,
} from '../resolvers/AbstractDependencyResolver';

export type DependencyResolver<TValue = any> = { value: TValue };

export type ComposeDependencyResolvers<TPrev, TKey extends string = any> = {
  <
    T1 extends (ctx: {}) => DependencyResolver<any> //breakme
  >(
    ...deps: [T1]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1]>>;

  <
    T1 extends (ctx: {}) => DependencyResolver<any>, //breakme
    T2 extends (ctx: ItemFactory<ReturnType<T1>>) => DependencyResolver<any>
  >(
    ...deps: [T1, T2]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2]>>;

  <
    T1 extends (ctx: {}) => DependencyResolver<any>, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => DependencyResolver<any>,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => DependencyResolver<any>
  >(
    ...deps: [T1, T2, T3?]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3]>>;

  <
    T1 extends (ctx: {}) => DependencyResolver<any>, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => DependencyResolver<any>,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => DependencyResolver<any>,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => DependencyResolver<any>
  >(
    ...deps: [T1, T2, T3, T4]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4]>>;

  <
    T1 extends (ctx: {}) => DependencyResolver<any>, //breakme
    T2 extends (ctx: ItemsRecords<[T1]>) => DependencyResolver<any>,
    T3 extends (ctx: ItemsRecords<[T1, T2]>) => DependencyResolver<any>,
    T4 extends (ctx: ItemsRecords<[T1, T2, T3]>) => DependencyResolver<any>,
    T5 extends (ctx: ItemsRecords<[T1, T2, T3, T4]>) => DependencyResolver<any>
  >(
    ...deps: [T1, T2, T3, T4, T5]
  ): ModuleBuilder<TPrev & ItemsRecords<[T1, T2, T3, T4, T5]>>;
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

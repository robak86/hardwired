import {
  BaseModuleBuilder,
  ClassType,
  Definition,
  ModuleRegistry,
  MaterializedModuleEntries,
  ModuleBuilder,
  RegistryRecord,
  NotDuplicated,
  NotDuplicatedKeys,
  RequiresDefinition,
  Thunk,
  unwrapThunk,
} from '@hardwired/di-core';

import { FunctionResolver } from '../resolvers/FunctionResolver';
import { SingletonResolver } from '../resolvers/SingletonResolver';
import { ClassRequestScopeResolver } from '../resolvers/ClassRequestScopeResolver';
import { ClassTransientResolver } from '../resolvers/ClassTransientResolver';
import { ClassSingletonResolver } from '../resolvers/ClassSingletonResolver';

export type NextCommonBuilder<TKey extends string, TReturn, TRegistryRecord extends RegistryRecord> = NotDuplicated<
  TKey,
  TRegistryRecord,
  CommonBuilder<TRegistryRecord & { [K in TKey]: Definition<TReturn> }>
>;

// export type NextCommonBuilder<TKey extends string, TReturn, TRegistryRecord extends RegistryRecord> = CommonBuilder<
//   TRegistryRecord & { [K in TKey]: Definition<TReturn> }
// >;

export type NextImportsModuleBuilder<
  TKey extends string,
  TReturn extends RegistryRecord,
  TRegistryRecord extends RegistryRecord
> = NotDuplicated<TKey, TRegistryRecord, CommonBuilder<TRegistryRecord & { [K in TKey]: ModuleBuilder<TReturn> }>>;

export class CommonBuilder<TRegistryRecord extends RegistryRecord> extends BaseModuleBuilder<TRegistryRecord> {
  constructor(registry: ModuleRegistry<TRegistryRecord>) {
    super(registry);
  }

  singleton<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextCommonBuilder<TKey, TResult, TRegistryRecord>;
  singleton<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistryRecord>;
  singleton<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(key, new ClassSingletonResolver(klass, depSelect));
    return new CommonBuilder(newRegistry) as any;
  }

  transient<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextCommonBuilder<TKey, TResult, TRegistryRecord>;
  transient<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistryRecord>;
  transient<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(key, new ClassTransientResolver(klass, depSelect));
    return new CommonBuilder(newRegistry) as any;
  }

  request<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextCommonBuilder<TKey, TResult, TRegistryRecord>;
  request<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistryRecord>;
  request<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(key, new ClassRequestScopeResolver(klass, depSelect));
    return new CommonBuilder(newRegistry) as any;
  }

  //TODO: use tuples with non limited TDeps?
  function<TKey extends string, TResult>(
    key: TKey,
    fn: () => TResult,
  ): NextCommonBuilder<TKey, () => TResult, TRegistryRecord>;
  function<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
  ): NextCommonBuilder<TKey, (d1: TDep1) => TResult, TRegistryRecord>;
  function<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => [TDep1],
  ): NextCommonBuilder<TKey, () => TResult, TRegistryRecord>;
  function<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
  ): NextCommonBuilder<TKey, (d1: TDep1, d2: TDep2) => TResult, TRegistryRecord>;
  function<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => [TDep1],
  ): NextCommonBuilder<TKey, (dep2: TDep2) => TResult, TRegistryRecord>;
  function<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => [TDep1, TDep2],
  ): NextCommonBuilder<TKey, () => TResult, TRegistryRecord>;
  // 3 args
  function<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  ): NextCommonBuilder<TKey, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult, TRegistryRecord>;
  function<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => [TDep1],
  ): NextCommonBuilder<TKey, (dep2: TDep2, dep3: TDep3) => TResult, TRegistryRecord>;
  function<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => [TDep1, TDep2],
  ): NextCommonBuilder<TKey, (dep3: TDep3) => TResult, TRegistryRecord>;
  function<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => [TDep1, TDep2, TDep3],
  ): NextCommonBuilder<TKey, () => TResult, TRegistryRecord>;
  function<TKey extends string, TDep1, TDep2, TDep3, TDep4, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3, d4: TDep4) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => [TDep1, TDep2, TDep3, TDep4],
  ): NextCommonBuilder<TKey, () => TResult, TRegistryRecord>;
  function(key, fn, depSelect?): any {
    const newRegistry = this.registry.extendDeclarations(key, new FunctionResolver(fn, depSelect));
    return new CommonBuilder(newRegistry);
  }

  import<TKey extends string, TImportedR extends RegistryRecord>(
    key: TKey,
    mod2: Thunk<ModuleBuilder<TImportedR>>,
  ): NextImportsModuleBuilder<TKey, TImportedR, TRegistryRecord> {
    return this.build(this.registry.extendImports(key, unwrapThunk(mod2).registry)) as any; //TODO: unwrap should happen at object construction - in other case it won't prevent for undefined values
  }

  external<TNextContext extends object>(): NotDuplicatedKeys<
    TRegistryRecord,
    TNextContext,
    CommonBuilder<TRegistryRecord & { [K in keyof TNextContext]: RequiresDefinition<TNextContext[K]> }>
  > {
    return this as any;
  }

  value<K extends string, V>(key: K, factory: V): NextCommonBuilder<K, V, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(key, new SingletonResolver(() => factory as any));
    return new CommonBuilder(newRegistry) as any;
  }

  factory<K extends string, V>(
    key: K,
    factory: (ctx: MaterializedModuleEntries<TRegistryRecord>) => V,
  ): NextCommonBuilder<K, V, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(key, new SingletonResolver(factory));
    return new CommonBuilder(newRegistry) as any;
  }
}

export const commonDefines = <TRegistryRecord extends RegistryRecord>(
  registry: ModuleRegistry<TRegistryRecord>,
): CommonBuilder<TRegistryRecord> => new CommonBuilder(registry);

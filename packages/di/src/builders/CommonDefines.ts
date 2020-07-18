import {
  ModuleRegistry,
  NotDuplicated,
  Definition,
  BaseModuleBuilder,
  ModuleBuilder,
  DefinitionsSet,
  ClassType,
  MaterializedModuleEntries,
  Thunk,
  NotDuplicatedKeys,
  RequiresDefinition,
  unwrapThunk,
} from '@hardwired/di-core';

import { FunctionResolver } from '../resolvers/FunctionResolver';
import { SingletonResolver } from '../resolvers/SingletonResolver';
import { ClassRequestScopeResolver } from '../resolvers/ClassRequestScopeResolver';
import { ClassTransientResolver } from '../resolvers/ClassTransientResolver';
import { ClassSingletonResolver } from '../resolvers/ClassSingletonResolver';

export type NextCommonBuilder<TKey extends string, TReturn, TRegistry extends ModuleRegistry> = NotDuplicated<
  TKey,
  TRegistry,
  CommonBuilder<TRegistry & { [K in TKey]: Definition<TReturn> }>
>;

export type NextImportsModuleBuilder<
  TKey extends string,
  TReturn extends ModuleRegistry,
  TRegistry extends ModuleRegistry
> = NotDuplicated<TKey, TRegistry, CommonBuilder<TRegistry & { [K in TKey]: ModuleBuilder<TReturn> }>>;

export class CommonBuilder<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  singleton<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextCommonBuilder<TKey, TResult, TRegistry>;
  singleton<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistry>;
  singleton<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new ClassSingletonResolver(klass, depSelect));
    return new CommonBuilder(newRegistry) as any;
  }

  transient<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextCommonBuilder<TKey, TResult, TRegistry>;
  transient<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistry>;
  transient<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new ClassTransientResolver(klass, depSelect));
    return new CommonBuilder(newRegistry) as any;
  }

  request<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextCommonBuilder<TKey, TResult, TRegistry>;
  request<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistry>;
  request<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextCommonBuilder<TKey, TResult, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new ClassRequestScopeResolver(klass, depSelect));
    return new CommonBuilder(newRegistry) as any;
  }

  function<TKey extends string, TResult>(
    key: TKey,
    fn: () => TResult,
  ): NextCommonBuilder<TKey, () => TResult, TRegistry>;
  function<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
  ): NextCommonBuilder<TKey, (d1: TDep1) => TResult, TRegistry>;
  function<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
  ): NextCommonBuilder<TKey, () => TResult, TRegistry>;
  function<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
  ): NextCommonBuilder<TKey, (d1: TDep1, d2: TDep2) => TResult, TRegistry>;
  function<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
  ): NextCommonBuilder<TKey, (dep2: TDep2) => TResult, TRegistry>;
  function<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2],
  ): NextCommonBuilder<TKey, () => TResult, TRegistry>;
  // 3 args
  function<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  ): NextCommonBuilder<TKey, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult, TRegistry>;
  function<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
  ): NextCommonBuilder<TKey, (dep2: TDep2, dep3: TDep3) => TResult, TRegistry>;
  function<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2],
  ): NextCommonBuilder<TKey, (dep3: TDep3) => TResult, TRegistry>;
  function<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2, TDep3],
  ): NextCommonBuilder<TKey, () => TResult, TRegistry>;
  function(key, fn, depSelect?): any {
    const newRegistry = this.registry.extendDeclarations(key, new FunctionResolver(fn, depSelect));
    return new CommonBuilder(newRegistry);
  }

  import<TKey extends string, TImportedR extends ModuleRegistry>(
    key: TKey,
    mod2: Thunk<ModuleBuilder<TImportedR>>,
  ): NextImportsModuleBuilder<TKey, TImportedR, TRegistry> {
    return this.build(this.registry.extendImports(key, unwrapThunk(mod2).registry)) as any; //TODO: unwrap should happen at object construction - in other case it won't prevent for undefined values
  }

  external<TNextContext extends object>(): NotDuplicatedKeys<
    TRegistry,
    TNextContext,
    CommonBuilder<TRegistry & { [K in keyof TNextContext]: RequiresDefinition<TNextContext[K]> }>
  > {
    return this as any;
  }

  value<K extends string, V>(key: K, factory: V): NextCommonBuilder<K, V, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new SingletonResolver(() => factory as any));
    return new CommonBuilder(newRegistry) as any;
  }
}

export const commonDefines = <TRegistry extends ModuleRegistry>(
  registry: DefinitionsSet<TRegistry>,
): CommonBuilder<TRegistry> => new CommonBuilder(registry);

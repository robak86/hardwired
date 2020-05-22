import { Definition, MaterializedModuleEntries, ModuleRegistry, RequiresDefinition } from '../module/ModuleRegistry';
import { BaseModuleBuilder } from './BaseModuleBuilder';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ClassType, NotDuplicated, NotDuplicatedKeys } from '../module/ModuleUtils';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { TransientResolver } from '../resolvers/TransientResolver';
import { CurriedFunctionResolver } from '../resolvers/CurriedFunctionResolver';
import { Thunk, unwrapThunk } from '../utils/thunk';
import { ModuleBuilder } from './ModuleBuilder';


// import { GlobalCommonResolver } from '../resolvers/global-common-resolver';

export type NextCommonBuilder<TKey extends string, TReturn, TRegistry extends ModuleRegistry> = NotDuplicated<
  TKey,
  TRegistry,
  CommonBuilder<
    {
      [K in keyof (TRegistry & { [K in TKey]: Definition<TReturn> })]: (TRegistry &
        { [K in TKey]: Definition<TReturn> })[K];
    }
  >
>;

export type NextImportsModuleBuilder<
  TKey extends string,
  TReturn extends ModuleRegistry,
  TRegistry extends ModuleRegistry
> = NotDuplicated<
  TKey,
  TRegistry,
  CommonBuilder<
    {
      [K in keyof (TRegistry & { [K in TKey]: ModuleBuilder<TReturn> })]: (TRegistry &
        { [K in TKey]: ModuleBuilder<TReturn> })[K];
    }
  >
>;

export class CommonBuilder<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  class<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): CommonBuilder<TRegistry & { [K in TKey]: Definition<TResult> }>;
  class<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): CommonBuilder<TRegistry & { [K in TKey]: Definition<TResult> }>;
  class<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): CommonBuilder<TRegistry & { [K in TKey]: Definition<TResult> }> {
    const newRegistry = this.registry.extendDeclarations(
      key,
      new GlobalSingletonResolver(container => {
        const selectDeps = depSelect ? depSelect : () => [];
        return new klass(...(selectDeps(container as any) as any));
      }),
    );

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
    const newRegistry = this.registry.extendDeclarations(key, new CurriedFunctionResolver(fn, depSelect));
    return new CommonBuilder(newRegistry);
  }

  import<TKey extends string, TImportedR extends ModuleRegistry>(
    key: TKey,
    mod2: Thunk<ModuleBuilder<TImportedR>>,
  ): NextImportsModuleBuilder<TKey, TImportedR, TRegistry> {
    return this.build(this.registry.extendImports(key, unwrapThunk(mod2).registry)) as any; //TODO: unwrap should happen at object construction - in other case it won't prevent for undefined values
  }

  singleton<K extends string, V>(
    key: K,
    factory: (container: MaterializedModuleEntries<TRegistry>) => V,
  ): NextCommonBuilder<K, V, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new GlobalSingletonResolver(factory as any));
    return new CommonBuilder(newRegistry) as any;
  }

  external<TNextContext extends object>(): NotDuplicatedKeys<
    TRegistry,
    TNextContext,
    CommonBuilder<TRegistry & { [K in keyof TNextContext]: RequiresDefinition<TNextContext[K]> }>
  > {
    return this as any;
  }

  transient<K extends string, V>(
    key: K,
    factory: (container: MaterializedModuleEntries<TRegistry>) => V,
  ): NextCommonBuilder<K, V, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new TransientResolver(factory as any));
    return new CommonBuilder(newRegistry) as any;
  }

  value<K extends string, V>(key: K, factory: V): NextCommonBuilder<K, V, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new GlobalSingletonResolver(() => factory as any));

    return new CommonBuilder(newRegistry) as any;
  }

  protected build(ctx) {
    return new CommonBuilder(ctx) as any;
  }
}

export const commonDefines = <TRegistry extends ModuleRegistry>(
  registry: DefinitionsSet<TRegistry>,
): CommonBuilder<TRegistry> => new CommonBuilder(registry);
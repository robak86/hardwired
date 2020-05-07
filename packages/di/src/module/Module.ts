import { DependencyResolver } from '../resolvers/DependencyResolver';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { Thunk, unwrapThunk, UnwrapThunk } from '../utils/thunk';
import { curry } from '../utils/curry';
import { Container } from '..';
import { DefinitionsSet } from './module-entries';
import { CurriedFunctionResolver } from '../resolvers/CurriedFunctionResolver';

export type Definition<T> = { definition: T };
export type RequiresDefinition<T> = { requires: T };

export type ModuleRegistry = Record<string, Thunk<Module<any>> | Definition<any> | RequiresDefinition<any>>;

export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never
  ? RETURN
  : 'Module contains duplicated definitions';

export type NotDuplicatedKeys<TSource, TTarget, TReturn> = Extract<keyof TSource, keyof TTarget> extends never
  ? TReturn
  : 'Module contains duplicated definitions';

type NextModuleDefinition<TDefinitionKey extends string, V, R extends ModuleRegistry> = NotDuplicated<
  TDefinitionKey,
  R,
  // Module<R & { [K in TDefinitionKey]: Definition<V> }>
  Module<
    { [K in keyof (R & { [K in TDefinitionKey]: Definition<V> })]: (R & { [K in TDefinitionKey]: Definition<V> })[K] }
  >
>;

type NextModuleImport<TImportKey extends string, V extends ModuleRegistry, R extends ModuleRegistry> = NotDuplicated<
  TImportKey,
  R,
  Module<R & { [K in TImportKey]: Module<V> } & ModuleRegistryContext<V>>
  // Module<{ [K in keyof (R & { [K in TImportKey]: V })]: (R & { [K in TImportKey]: V })[K] }>
>;

export type MaterializedDefinitions<R extends ModuleRegistry> = {
  [K in ModuleRegistryDefinitionsKeys<R>]: ModuleRegistryDefinitions<R>[K] extends Definition<infer TDefinition>
    ? TDefinition
    : never;
};

export type MaterializedImports<R extends ModuleRegistry> = {
  [K in ModuleRegistryImportsKeys<R>]: MaterializedDefinitions<ModuleRegistryImports<R>[K]>;
};

export type MaterializedModuleEntries<R extends ModuleRegistry> = MaterializedDefinitions<R> & MaterializedImports<R>;

export type ClassType<TConstructorArgs extends any[], TInstance> = {
  new (...args: TConstructorArgs): TInstance;
};

type FilterPrivateFields<T> = T extends Function
  ? T
  : {
      [K in keyof T]: T[K];
    };

// TODO: add moduleId and name
export class Module<R extends ModuleRegistry> {
  public debug!: R;

  constructor(public registry: DefinitionsSet<R>) {}

  hasModule(key: ModuleRegistryImportsKeys<R>): boolean {
    return this.registry.hasImport(key); // TODO: hacky - because we cannot be sure that this key is a module and not a import
  }

  isDeclared(key: ModuleRegistryDefinitionsKeys<R>): boolean {
    return this.registry.hasDeclaration(key);
  }

  require<TNextContext extends object>(): NotDuplicatedKeys<
    R,
    TNextContext,
    Module<R & { [K in keyof TNextContext]: RequiresDefinition<TNextContext[K]> }>
  > {
    return this as any;
  }

  define<K extends string, V, C1>(
    key: K,
    factory: DependencyResolver<MaterializedModuleEntries<R>, V>,
  ): NextModuleDefinition<K, V, R>;
  define<K extends string, V, C1>(
    key: K,
    factory: (container: MaterializedModuleEntries<R>, ctx: C1) => V, // TODO: its unclear if this single override shouldn't be exposed in the api
  ): NextModuleDefinition<K, V, R>;
  define<K extends string, V, C1>(
    key: K,
    factory:
      | DependencyResolver<MaterializedModuleEntries<R>, V>
      | ((container: MaterializedModuleEntries<R>, ctx: C1) => V),
  ): NextModuleDefinition<K, V, R> {
    const resolver = typeof factory === 'function' ? new GlobalSingletonResolver(factory) : factory;
    return new Module(this.registry.extendDeclarations(key, resolver)) as any;
  }

  define2<K extends string, V, C1>(
    key: K,
    factory: (container: MaterializedModuleEntries<R>) => DependencyResolver<MaterializedModuleEntries<R>, V>,
  ): NextModuleDefinition<K, V, R> {
    const resolver = typeof factory === 'function' ? new GlobalSingletonResolver(factory) : factory;
    return new Module(this.registry.extendDeclarations(key, resolver)) as any;
  }

  defineConst<TKey extends string, TValue>(key: TKey, value: TValue): NextModuleDefinition<TKey, TValue, R> {
    return this.define(key, () => value);
  }

  // TODO: define -> register -> useClass -> ??
  defineClass<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextModuleDefinition<TKey, TResult, R>;
  defineClass<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<R>) => TDeps,
  ): NextModuleDefinition<TKey, TResult, R>;
  defineClass<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<R>) => TDeps,
  ): NextModuleDefinition<TKey, TResult, R> {
    return this.define(key, container => {
      const selectDeps = depSelect ? depSelect : () => [];
      return new klass(...(selectDeps(container) as any));
    });
  }

  defineFunction<TKey extends string, TResult>(
    key: TKey,
    fn: () => TResult,
  ): NextModuleDefinition<TKey, () => TResult, R>;
  defineFunction<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
  ): NextModuleDefinition<TKey, (d1: TDep1) => TResult, R>;
  defineFunction<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1],
  ): NextModuleDefinition<TKey, () => TResult, R>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
  ): NextModuleDefinition<TKey, (d1: TDep1, d2: TDep2) => TResult, R>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1],
  ): NextModuleDefinition<TKey, (dep2: TDep2) => TResult, R>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1, TDep2],
  ): NextModuleDefinition<TKey, () => TResult, R>;
  // 3 args
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  ): NextModuleDefinition<TKey, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult, R>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1],
  ): NextModuleDefinition<TKey, (dep2: TDep2, dep3: TDep3) => TResult, R>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1, TDep2],
  ): NextModuleDefinition<TKey, (dep3: TDep3) => TResult, R>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1, TDep2, TDep3],
  ): NextModuleDefinition<TKey, () => TResult, R>;
  defineFunction(key, fn, depSelect?): any {
    return this.define(key, new CurriedFunctionResolver(fn, depSelect));
  }

  // TODO: use Flatten to make this method type safe
  inject<TNextR extends ModuleRegistry>(otherModule: Module<TNextR>): Module<R> {
    return new Module(this.registry.inject(otherModule.registry));
  }

  replace<K extends ModuleRegistryDefinitionsKeys<R>, C>(
    key: K,
    factory: (container: MaterializedModuleEntries<R>, C) => FilterPrivateFields<MaterializedDefinitions<R>[K]>,
  ): Module<R> {
    return this.undeclare(key).define(key as any, factory as any) as any;
  }

  // convenient method for providing mocks for testing
  replaceConst<K extends ModuleRegistryDefinitionsKeys<R>, C>(
    key: K,
    value: ModuleRegistryDefinitions<R>[K],
  ): Module<R> {
    return this.undeclare(key).define(key as any, () => value) as any;
  }

  //TODO: should be private. because it breaks typesafety when module is nested? ()
  undeclare<K extends ModuleRegistryDefinitionsKeys<R>>(key: K): Module<Omit<R, K>> {
    return new Module(this.registry.removeDeclaration(key)) as any;
  }

  import<K extends string, TImportedR extends ModuleRegistry>(
    key: K,
    mod2: Thunk<Module<TImportedR>>,
  ): NextModuleImport<K, TImportedR, R> {
    return new Module(this.registry.extendImports(key, unwrapThunk(mod2).registry)) as any;
  }

  // TODO: use mapped type similar to Definitions
  toContainer(ctx: any): Container<R> {
    return new Container(this.registry, ctx);
  }
}

type DefinitionsUnion<T> = {
  [K in keyof T]: T[K] extends Definition<any> ? T[K] : never;
}[keyof T];

export type ModuleRegistryDefinitionsKeys<T> = { [K in keyof T]: T[K] extends Definition<any> ? K : never }[keyof T];
export type ModuleRegistryDefinitions<T> = { [K in ModuleRegistryDefinitionsKeys<T>]: T[K] };

export type ModuleRegistryContextKeys<T> = {
  [K in keyof T]: T[K] extends RequiresDefinition<any> ? K : never;
}[keyof T];
export type ModuleRegistryContext<T> = { [K in ModuleRegistryContextKeys<T>]: T[K] };

export type ModuleRegistryImportsKeys<T> = {
  [K in keyof T]: UnwrapThunk<T[K]> extends Module<any> ? K : never;
}[keyof T];
export type ModuleRegistryImports<T> = {
  [K in ModuleRegistryImportsKeys<T>]: UnwrapThunk<T[K]> extends Module<infer R> ? R : never;
};

export type FlattenModules<R extends ModuleRegistry> =
  | R
  | {
      [K in keyof ModuleRegistryImports<R>]: FlattenModules<ModuleRegistryImports<R>[K]>;
    }[keyof ModuleRegistryImports<R>];

// export type FlattenModules<R> =
//   | (R extends Module<infer RR> ? RR : R)
//   | {
//   [K in keyof Imports<R>]: FlattenModules<Imports<R>[K]>;
// }[keyof Imports<R>];

// | Definitions<R extends Module<infer RR> ? RR : R>
// export type FlattenModules<R extends ModuleDefinitions> =
//   | R
//   | {
//       [K in keyof Imports<R>]: FlattenModules<Imports<R>[K] extends Module<infer RR> ? RR : never>;
//     }[keyof Imports<R>];

// type ZZ = Definitions<typeof b.defs>;
// type ZZz = Imports<typeof b.defs>;
//
// type Fla = FlattenModules<typeof b.defs>;
//
// const wtf2: Fla = ap;
// const wtf22: Fla = a;

// type Wrapped<T> = { wrapped: T };
//
// function accept<T>(fn: () => Wrapped<T>): Wrapped<T> {
//   throw new Error('Implement me');
// }
//
// const z = accept(() => {
//   if (Math.random()) {
//     return { wrapped: 1 };
//   } else {
//     return { wrapped: 'sdf' };
//   }
// });



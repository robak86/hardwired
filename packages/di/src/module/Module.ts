import { DependencyResolver } from '../resolvers/DependencyResolver';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { Thunk, unwrapThunk, UnwrapThunk } from '../utils/thunk';
import { curry } from '../utils/curry';
import { Container } from '..';
import { DefinitionsSet } from './module-entries';

export type Definition<T> = { definition: T };
export type RequiresDefinition<T> = { requires: T };

export type ModuleDefinitions = Record<string, Thunk<Module<any>> | Definition<any> | RequiresDefinition<any>>;

export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never
  ? RETURN
  : 'Module contains duplicated definitions';

export type NotDuplicatedKeys<TSource, TTarget, TReturn> = Extract<keyof TSource, keyof TTarget> extends never
  ? TReturn
  : 'Module contains duplicated definitions';

type NextModuleDefinition<TDefinitionKey extends string, V, R extends ModuleDefinitions> = NotDuplicated<
  TDefinitionKey,
  R,
  // Module<R & { [K in TDefinitionKey]: Definition<V> }>
  Module<
    { [K in keyof (R & { [K in TDefinitionKey]: Definition<V> })]: (R & { [K in TDefinitionKey]: Definition<V> })[K] }
  >
>;

type NextModuleImport<
  TImportKey extends string,
  V extends ModuleDefinitions,
  R extends ModuleDefinitions
> = NotDuplicated<
  TImportKey,
  R,
  Module<R & { [K in TImportKey]: Module<V> } & Externals<V>>
  // Module<{ [K in keyof (R & { [K in TImportKey]: V })]: (R & { [K in TImportKey]: V })[K] }>
>;

export type MaterializedDefinitions<R extends ModuleDefinitions> = {
  [K in DefinitionsKeys<R>]: Definitions<R>[K] extends Definition<infer TDefinition> ? TDefinition : never;
};

export type MaterializedImports<R extends ModuleDefinitions> = {
  [K in ImportsKeys<R>]: MaterializedDefinitions<Imports<R>[K]>;
};

export type MaterializedModuleEntries<R extends ModuleDefinitions> = MaterializedDefinitions<R> &
  MaterializedImports<R>;

export type ClassType<TConstructorArgs extends any[], TInstance> = {
  new (...args: TConstructorArgs): TInstance;
};

type FilterPrivateFields<T> = T extends Function
  ? T
  : {
      [K in keyof T]: T[K];
    };

// TODO: add moduleId and name
export class Module<R extends ModuleDefinitions> {
  public debug: R;

  constructor(public entries: DefinitionsSet<R>) {}

  hasModule(key: ImportsKeys<R>): boolean {
    return this.entries.hasImport(key); // TODO: hacky - because we cannot be sure that this key is a module and not a import
  }

  isDeclared(key: DefinitionsKeys<R>): boolean {
    return this.entries.hasDeclaration(key);
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
    factory: (container: MaterializedModuleEntries<R>, ctx: C1) => V,
  ): NextModuleDefinition<K, V, R>;
  define<K extends string, V, C1>(
    key: K,
    factory:
      | DependencyResolver<MaterializedModuleEntries<R>, V>
      | ((container: MaterializedModuleEntries<R>, ctx: C1) => V),
  ): NextModuleDefinition<K, V, R> {
    const resolver = typeof factory === 'function' ? new GlobalSingletonResolver(factory) : factory;
    return new Module(this.entries.extendDeclarations(key, resolver)) as any;
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
    const curried = curry(fn);
    const select = depSelect ? depSelect : () => [];
    // TODO: container => {...} should be wrapped in some concrete DependencyResolver instance (.e.g CurriedFunctionResolver)
    return this.define(key, container => {
      const params = select(container);
      if (params.length === fn.length) {
        return () => fn(...params);
      } else {
        return curried(...params);
      }
    });
  }

  // TODO: use Flatten to make this method type safe
  inject<TNextR extends ModuleDefinitions>(otherModule: Module<TNextR>): Module<R> {
    return new Module(this.entries.inject(otherModule.entries));
  }

  replace<K extends DefinitionsKeys<R>, C>(
    key: K,
    factory: (container: MaterializedModuleEntries<R>, C) => FilterPrivateFields<MaterializedDefinitions<R>[K]>,
  ): Module<R> {
    return this.undeclare(key).define(key as any, factory as any) as any;
  }

  // convenient method for providing mocks for testing
  replaceConst<K extends DefinitionsKeys<R>, C>(key: K, value: Definitions<R>[K]): Module<R> {
    return this.undeclare(key).define(key as any, () => value) as any;
  }

  //TODO: should be private. because it breaks typesafety when module is nested? ()
  undeclare<K extends DefinitionsKeys<R>>(key: K): Module<Omit<R, K>> {
    return new Module(this.entries.removeDeclaration(key)) as any;
  }

  import<K extends string, TImportedR extends ModuleDefinitions>(
    key: K,
    mod2: Thunk<Module<TImportedR>>,
  ): NextModuleImport<K, TImportedR, R> {
    return new Module(this.entries.extendImports(key, unwrapThunk(mod2).entries)) as any;
  }

  // TODO: use mapped type similar to Definitions
  toContainer(ctx: any): Container<R> {
    return new Container(this.entries, ctx);
  }
}

type DefinitionsUnion<T> = {
  [K in keyof T]: T[K] extends Definition<any> ? T[K] : never;
}[keyof T];

export type DefinitionsKeys<T> = { [K in keyof T]: T[K] extends Definition<any> ? K : never }[keyof T];
export type Definitions<T> = { [K in DefinitionsKeys<T>]: T[K] };

export type ExternalsKeys<T> = { [K in keyof T]: T[K] extends RequiresDefinition<any> ? K : never }[keyof T];
export type Externals<T> = { [K in ExternalsKeys<T>]: T[K] };

export type ImportsKeys<T> = { [K in keyof T]: UnwrapThunk<T[K]> extends Module<any> ? K : never }[keyof T];
export type Imports<T> = {
  [K in ImportsKeys<T>]: UnwrapThunk<T[K]> extends Module<infer R> ? R : never;
};

export type FlattenModules<R extends ModuleDefinitions> =
  | R
  | {
      [K in keyof Imports<R>]: FlattenModules<Imports<R>[K]>;
    }[keyof Imports<R>];

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

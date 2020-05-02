// type ModuleRegistry<I, D, C> = {
//   imports: I;
//   declarations: D;
//   context: C;
// };

import { ImmutableSet } from '../ImmutableSet';
import { NotDuplicated } from './Module';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { Thunk, unwrapThunk, UnwrapThunk } from '../utils/thunk';
import { curry } from '../utils/curry';
import { Container } from '..';

type Definition<T> = { definition: T };

type ModuleDefinitions = Record<string, Thunk<Module<any>> | Definition<any>>;

type NextModule<K extends string, V, R extends ModuleDefinitions, C, C1> = NotDuplicated<
  K,
  R,
  Module<R & Record<K, V>>
>;

type MaterializedDefinitions<R extends ModuleDefinitions> = {
  [K in DefinitionsKeys<R>]: Definitions<R>[K] extends Definition<infer TDefinition> ? TDefinition : never;
};

type MaterializedImports<R extends ModuleDefinitions> = {
  [K in ImportsKeys<R>]: MaterializedDefinitions<Definitions<Imports<R>[K]>>;
};

export type MaterializedModuleEntries<R extends ModuleDefinitions> = MaterializedDefinitions<R> &
  MaterializedImports<R>;

type DefinitionsSet<R> = ImmutableSet<any>; //TODO: Remap R to support resolver types

export type ClassType<TConstructorArgs extends any[], TInstance> = {
  new (...args: TConstructorArgs): TInstance;
};

type FilterPrivateFields<T> = T extends Function
  ? T
  : {
      [K in keyof T]: T[K];
    };

export class Module<R extends ModuleDefinitions, C = {}> {
  constructor(public definition: DefinitionsSet<R>) {}

  hasModule(key: ImportsKeys<R>): boolean {
    return this.definition.hasKey(key); // TODO: hacky - because we cannot be sure that this key is a module and not a import
  }

  isDeclared(key: DefinitionsKeys<R>): boolean {
    return this.definition.hasKey(key);
  }

  define<K extends string, V, C1>(
    key: K,
    factory: DependencyResolver<MaterializedModuleEntries<R>, V>,
  ): NextModule<K, V, R, C, C1>;
  define<K extends string, V, C1>(
    key: K,
    factory: (container: MaterializedModuleEntries<R>, ctx: C1) => V,
  ): NextModule<K, V, R, C, C1>;
  define<K extends string, V, C1>(
    key: K,
    factory:
      | DependencyResolver<MaterializedModuleEntries<R>, V>
      | ((container: MaterializedModuleEntries<R>, ctx: C1) => V),
  ): NextModule<K, V, R, C, C1> {
    const resolver = typeof factory === 'function' ? new GlobalSingletonResolver(factory) : factory;
    return new Module(this.definition.set(key, resolver)) as any;
  }

  defineConst<TKey extends string, TValue>(key: TKey, value: TValue): NextModule<TKey, TValue, R, C, C> {
    return this.define(key, () => value);
  }

  // TODO: define -> register -> useClass -> ??
  defineClass<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextModule<TKey, TResult, R, C, C>;
  defineClass<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<R>) => TDeps,
  ): NextModule<TKey, TResult, R, C, C>;
  defineClass<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<R>) => TDeps,
  ): NextModule<TKey, TResult, R, C, C> {
    return this.define(key, container => {
      const selectDeps = depSelect ? depSelect : () => [];
      return new klass(...(selectDeps(container) as any));
    });
  }

  defineFunction<TKey extends string, TResult>(key: TKey, fn: () => TResult): NextModule<TKey, () => TResult, R, C, C>;
  defineFunction<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
  ): NextModule<TKey, (d1: TDep1) => TResult, R, C, C>;
  defineFunction<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1],
  ): NextModule<TKey, () => TResult, R, C, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
  ): NextModule<TKey, (d1: TDep1, d2: TDep2) => TResult, R, C, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1],
  ): NextModule<TKey, (dep2: TDep2) => TResult, R, C, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1, TDep2],
  ): NextModule<TKey, () => TResult, R, C, C>;
  // 3 args
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  ): NextModule<TKey, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult, R, C, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1],
  ): NextModule<TKey, (dep2: TDep2, dep3: TDep3) => TResult, R, C, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1, TDep2],
  ): NextModule<TKey, (dep3: TDep3) => TResult, R, C, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<R>) => [TDep1, TDep2, TDep3],
  ): NextModule<TKey, () => TResult, R, C, C>;
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
    throw new Error('Implement me');
    // return new Module(this.definitions.inject(otherModule.entries));
  }

  replace<K extends DefinitionsKeys<R>, C>(
    key: K,
    factory: (container: MaterializedModuleEntries<R>, C) => FilterPrivateFields<Definitions<R>[K]>,
  ): Module<R> {
    return this.undeclare(key).define(key as any, factory as any) as any;
  }

  // convenient method for providing mocks for testing
  replaceConst<K extends DefinitionsKeys<R>, C>(key: K, value: Definitions<R>[K]): Module<R> {
    return this.undeclare(key).define(key as any, () => value) as any;
  }

  //TODO: should be private. because it breaks typesafety when module is nested? ()
  undeclare<K extends keyof DefinitionsKeys<R>>(key: K): Module<Omit<R, K>, C> {
    return new Module(this.definition.remove(key)) as any;
  }

  import<K extends string, TImportedR extends ModuleDefinitions>(
    key: K,
    mod2: Thunk<Module<TImportedR>>,
  ): NextModule<K, Module<TImportedR>, R, C, C> {
    return new Module(this.definition.set(key, unwrapThunk(mod2).definition)) as any;
  }

  // toContainer(ctx: C): Container<R> {
  //   return new Container(this.definition, ctx);
  // }
}

const module = <I extends Record<string, Module<any>>, D extends Record<string, Definition<any>>>() => {
  return new Module<{ [K in keyof (I & D)]: (I & D)[K] }>(null as any);
};

const a = module<{}, { z: Definition<number> }>();
const ap = module<{}, { z2: Definition<number> }>();

const b = module<{ imported: typeof a }, { z: Definition<number>; j: Definition<string> }>();
const c = module<{ imported: typeof b; imported2: typeof ap }, { z: Definition<number>; j: Definition<string> }>();

type DefinitionsUnion<T> = {
  [K in keyof T]: T[K] extends Definition<any> ? T[K] : never;
}[keyof T];

type DefinitionsKeys<T> = { [K in keyof T]: T[K] extends Definition<any> ? K : never }[keyof T];
type Definitions<T> = Pick<T, DefinitionsKeys<T>>;

type ImportsKeys<T> = { [K in keyof T]: UnwrapThunk<T[K]> extends Module<any> ? K : never }[keyof T];
type Imports<T> = Pick<T, ImportsKeys<T>>;

type FlattenModules<R extends ModuleDefinitions> =
  | (R extends ModuleDefinitions ? Module<R> : R)
  | {
      [K in keyof Imports<R>]: FlattenModules<Imports<R>[K]>;
    }[keyof Imports<R>];

// type ZZ = Definitions<typeof b.defs>;
// type ZZz = Imports<typeof b.defs>;
//
// type Fla = FlattenModules<typeof b.defs>;
//
// const wtf2: Fla = ap;
// const wtf22: Fla = a;

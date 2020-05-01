import { Thunk, UnwrapThunk, unwrapThunk } from '../utils/thunk';
import {
  DefinitionsRecord,
  ExtractModuleDeclarations,
  ExtractModuleImports,
  ExtractModuleRegistryDeclarations,
  ExtractModuleRegistryImports,
  ImportsRecord,
  MaterializedModuleEntries,
  ModuleEntries,
} from './module-entries';
import { Container } from '../container/Container';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { ModuleId } from '../module-id';
import { curry } from '../utils/curry';

/*
TODO: refactor plan

* extract all complex types to separate types/interfaces
* define class methods as properties
* Add typesafety checks (look at the omni type library)

someMethod: ExtractedComplexType = (p1,p2,p3) => {

}


* make Module inherit from Immutable base class ./look at the immutable directory examples!

 */

type ClassType<TConstructorArgs extends any[], TInstance> = {
  new (...args: TConstructorArgs): TInstance;
};

class Test {}

// Helper type for preserving only public properties.
type FilterPrivateFields<T> = T extends Function
  ? T
  : {
      [K in keyof T]: T[K];
    };

export type ModuleContext<M> = M extends Module<any, any, infer CTX> ? CTX : never;

export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never
  ? RETURN
  : 'Module contains duplicated definitions';

//TODO: .defineAsync should return AsyncModule! (container(...) should accept only Module asyncContainer(...) should accept AsyncModule)
//TODO: .import() should return AsyncModule if imported module is async

type ModuleWithNextDefinition<
  K extends string,
  V,
  C1,
  I extends ImportsRecord,
  D extends DefinitionsRecord,
  C
> = NotDuplicated<K, D, Module<I, D & Record<K, V>, C & C1>>;

type ModuleWithImport<
  K extends string,
  I1 extends ImportsRecord,
  D1 extends DefinitionsRecord,
  I extends ImportsRecord,
  D extends DefinitionsRecord,
  C
> = NotDuplicated<K, I, Module<I & Record<K, Thunk<ModuleEntries<I1, D1>>>, D, C>>;

export type FlattenModule<I extends ImportsRecord = {}, D extends DefinitionsRecord = {}, C = {}> =
  | Module<I, D, C>
  | {
      [K in keyof I]: UnwrapThunk<I[keyof I]>;
    };
// | {
//     [K in keyof I]: FlattenModule<
//       ExtractModuleRegistryImports<UnwrapThunk<I[keyof I]>>,
//       ExtractModuleRegistryDeclarations<UnwrapThunk<I[keyof I]>>
//     >;
//   };

export class Module<I extends ImportsRecord = {}, D extends DefinitionsRecord = {}, C = {}> {
  constructor(private definitions: ModuleEntries<I, D>) {}

  get entries(): ModuleEntries<I, D> {
    return this.definitions;
  }

  get id(): ModuleId {
    return this.definitions.moduleId;
  }

  // TODO make constructor to accept partial object with moduleId, declarations, etc.
  hasModule(key: keyof I): boolean {
    return this.definitions.hasImport(key);
  }

  isDeclared(key: keyof D): boolean {
    return this.definitions.hasDeclaration(key);
  }

  // TODO: this define should only accept DependencyResolver as a second argument (no additional overrides)
  // It will be general purpose define for registering more complicated dependencies (some transient, scoped shit - assuming that we wanna even have them)
  // For simple registration one should use specialized .defineFunction and defineClass/Instance ?
  // TODO: in order to apply conditional resolution we need to create specialized dependencyResolver
  define<K extends string, V, C1>(
    key: K,
    factory: DependencyResolver<MaterializedModuleEntries<I, D>, V>,
  ): ModuleWithNextDefinition<K, V, C1, I, D, C>;
  define<K extends string, V, C1>(
    key: K,
    factory: (container: MaterializedModuleEntries<I, D>, ctx: C1) => V,
  ): ModuleWithNextDefinition<K, V, C1, I, D, C>;
  define<K extends string, V, C1>(
    key: K,
    factory:
      | DependencyResolver<MaterializedModuleEntries<I, D>, V>
      | ((container: MaterializedModuleEntries<I, D>, ctx: C1) => V),
  ): ModuleWithNextDefinition<K, V, C1, I, D, C> {
    const resolver = typeof factory === 'function' ? new GlobalSingletonResolver(factory) : factory;
    return new Module(this.definitions.extendDeclarations(key, resolver)) as any;
  }

  defineConst<TKey extends string, TValue>(
    key: TKey,
    value: TValue,
  ): ModuleWithNextDefinition<TKey, TValue, C, I, D, C> {
    return this.define(key, () => value);
  }

  // TODO: define -> register -> useClass -> ??
  defineClass<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): ModuleWithNextDefinition<TKey, TResult, C, I, D, C>;
  defineClass<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<I, D>) => TDeps,
  ): ModuleWithNextDefinition<TKey, TResult, C, I, D, C>;
  defineClass<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<I, D>) => TDeps,
  ): ModuleWithNextDefinition<TKey, TResult, C, I, D, C> {
    return this.define(key, container => {
      const selectDeps = depSelect ? depSelect : () => [];
      return new klass(...(selectDeps(container) as any));
    });
  }

  defineFunction<TKey extends string, TResult>(
    key: TKey,
    fn: () => TResult,
  ): ModuleWithNextDefinition<TKey, () => TResult, C, I, D, C>;
  defineFunction<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
  ): ModuleWithNextDefinition<TKey, (d1: TDep1) => TResult, C, I, D, C>;
  defineFunction<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D>) => [TDep1],
  ): ModuleWithNextDefinition<TKey, () => TResult, C, I, D, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
  ): ModuleWithNextDefinition<TKey, (d1: TDep1, d2: TDep2) => TResult, C, I, D, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D>) => [TDep1],
  ): ModuleWithNextDefinition<TKey, (dep2: TDep2) => TResult, C, I, D, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D>) => [TDep1, TDep2],
  ): ModuleWithNextDefinition<TKey, () => TResult, C, I, D, C>;
  // 3 args
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  ): ModuleWithNextDefinition<TKey, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult, C, I, D, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D>) => [TDep1],
  ): ModuleWithNextDefinition<TKey, (dep2: TDep2, dep3: TDep3) => TResult, C, I, D, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D>) => [TDep1, TDep2],
  ): ModuleWithNextDefinition<TKey, (dep3: TDep3) => TResult, C, I, D, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D>) => [TDep1, TDep2, TDep3],
  ): ModuleWithNextDefinition<TKey, () => TResult, C, I, D, C>;
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

  // TODO: rename -> replaceModule() ?
  // TODO: make sure that inject replaces all module occurrences - given module can be imported many times - write specs
  inject<D1, I1 extends ImportsRecord, C1>(otherModule: Module<I1, D1, C1>): Module<I, D, C> {
    return new Module(this.definitions.inject(otherModule.entries));
  }

  replace<K extends keyof D, C>(
    key: K,
    factory: (container: MaterializedModuleEntries<I, D>, C) => FilterPrivateFields<D[K]>,
  ): Module<I, D, C> {
    return this.undeclare(key).define(key as any, factory as any) as any;
  }

  // convenient method for providing mocks for testing
  replaceConst<K extends keyof D, C>(key: K, value: D[K]): Module<I, D, C> {
    return this.undeclare(key).define(key as any, () => value) as any;
  }

  //TODO: should be private. because it breaks typesafety when module is nested? ()
  undeclare<K extends keyof D>(key: K): Module<I, Omit<D, K>, C> {
    return new Module(this.definitions.removeDeclaration(key)) as any;
  }

  import<K extends string, I1 extends ImportsRecord, D1 extends DefinitionsRecord>(
    key: K,
    mod2: Thunk<Module<I1, D1>>,
  ): ModuleWithImport<K, I1, D1, I, D, C> {
    return new Module(this.definitions.extendImports(key, unwrapThunk(mod2).definitions)) as any;
  }

  toContainer(ctx: C): Container<I, D> {
    return new Container(this.entries, ctx);
  }
}

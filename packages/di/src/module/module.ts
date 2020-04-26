import { Thunk, unwrapThunk } from '../utils/thunk';
import {
  AsyncDefinitionsRecord,
  DefinitionsRecord,
  ImportsRecord,
  MaterializedModuleEntries,
  ModuleEntries,
} from './module-entries';
import { Container } from '../container/Container';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { ModuleId } from '../module-id';
import { AsyncDependencyDefinition } from '../utils/async-dependency-resolver';
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

export type ModuleContext<M> = M extends Module<any, any, any, infer CTX> ? CTX : never;

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
  AD extends AsyncDefinitionsRecord,
  C
> = NotDuplicated<K, D, Module<I, D & Record<K, V>, AD, C & C1>>;

type ModuleWithNextAsyncDefinition<
  K extends string,
  V,
  C1,
  I extends ImportsRecord,
  D extends DefinitionsRecord,
  AD extends AsyncDefinitionsRecord,
  C
> = NotDuplicated<K, D, Module<I, D, AD & Record<K, V>, C & C1>>;

type ModuleWithImport<
  K extends string,
  I1 extends ImportsRecord,
  D1 extends DefinitionsRecord,
  AD1 extends AsyncDefinitionsRecord,
  I extends ImportsRecord,
  D extends DefinitionsRecord,
  AD extends AsyncDefinitionsRecord,
  C
> = NotDuplicated<K, I, Module<I & Record<K, Thunk<ModuleEntries<I1, D1, AD1>>>, D, AD, C>>;

type DefineAsyncContext<
  I extends ImportsRecord,
  D extends DefinitionsRecord,
  AD extends AsyncDefinitionsRecord
> = MaterializedModuleEntries<I, D, AD>;

export class Module<
  I extends ImportsRecord = {},
  D extends DefinitionsRecord = {},
  AD extends AsyncDefinitionsRecord = {},
  C = {}
> {
  constructor(private definitions: ModuleEntries<I, D, AD>) {}

  get entries(): ModuleEntries<I, D, AD> {
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
    factory: DependencyResolver<MaterializedModuleEntries<I, D, AD>, V>,
  ): ModuleWithNextDefinition<K, V, C1, I, D, AD, C>;
  define<K extends string, V, C1>(
    key: K,
    factory: (container: MaterializedModuleEntries<I, D, AD>, ctx: C1) => V,
  ): ModuleWithNextDefinition<K, V, C1, I, D, AD, C>;
  define<K extends string, V, C1>(
    key: K,
    factory:
      | DependencyResolver<MaterializedModuleEntries<I, D, AD>, V>
      | ((container: MaterializedModuleEntries<I, D, AD>, ctx: C1) => V),
  ): ModuleWithNextDefinition<K, V, C1, I, D, AD, C> {
    const resolver = typeof factory === 'function' ? new GlobalSingletonResolver(factory) : factory;
    return new Module(this.definitions.extendDeclarations(key, resolver)) as any;
  }

  defineConst<TKey extends string, TValue>(
    key: TKey,
    value: TValue,
  ): ModuleWithNextDefinition<TKey, TValue, C, I, D, AD, C> {
    return this.define(key, () => value);
  }

  // TODO: define -> register -> useClass -> ??
  defineClass<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): ModuleWithNextDefinition<TKey, TResult, C, I, D, AD, C>;
  defineClass<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => TDeps,
  ): ModuleWithNextDefinition<TKey, TResult, C, I, D, AD, C>;
  defineClass<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<I, D, AD>) => TDeps,
  ): ModuleWithNextDefinition<TKey, TResult, C, I, D, AD, C> {
    return this.define(key, container => {
      const selectDeps = depSelect ? depSelect : () => [];
      return new klass(...(selectDeps(container) as any));
    });
  }

  defineFunction<TKey extends string, TResult>(
    key: TKey,
    fn: () => TResult,
  ): ModuleWithNextDefinition<TKey, () => TResult, C, I, D, AD, C>;
  defineFunction<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
  ): ModuleWithNextDefinition<TKey, (d1: TDep1) => TResult, C, I, D, AD, C>;
  defineFunction<TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1],
  ): ModuleWithNextDefinition<TKey, () => TResult, C, I, D, AD, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
  ): ModuleWithNextDefinition<TKey, (d1: TDep1, d2: TDep2) => TResult, C, I, D, AD, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1],
  ): ModuleWithNextDefinition<TKey, (dep2: TDep2) => TResult, C, I, D, AD, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1, TDep2],
  ): ModuleWithNextDefinition<TKey, () => TResult, C, I, D, AD, C>;
  // 3 args
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  ): ModuleWithNextDefinition<TKey, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult, C, I, D, AD, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1],
  ): ModuleWithNextDefinition<TKey, (dep2: TDep2, dep3: TDep3) => TResult, C, I, D, AD, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1, TDep2],
  ): ModuleWithNextDefinition<TKey, (dep3: TDep3) => TResult, C, I, D, AD, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1, TDep2, TDep3],
  ): ModuleWithNextDefinition<TKey, () => TResult, C, I, D, AD, C>;
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

  // TODO: does not work because of currying :/
  // replaceFunction<TKey extends keyof D, TResult extends ReturnType<D[TKey]>>(
  //   key: TKey,
  //   fn: () => TResult,
  // ): Module<I, D, AD, C>;
  // replaceFunction<TKey extends keyof D, TDep1, TResult extends ReturnType<D[TKey]>>(
  //   key: TKey,
  //   fn: (d1: TDep1) => TResult,
  // ): Module<I, D, AD, C>;
  // replaceFunction<TKey extends keyof D, TDep1, TResult extends ReturnType<D[TKey]>>(
  //   key: TKey,
  //   fn: (d1: TDep1) => TResult,
  //   depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1],
  // ): Module<I, D, AD, C>;
  // replaceFunction<TKey extends keyof D, TDep1, TDep2, TResult extends ReturnType<D[TKey]>>(
  //   key: TKey,
  //   fn: (d1: TDep1, d2: TDep2) => TResult,
  // ): Module<I, D, AD, C>;
  // replaceFunction<TKey extends keyof D, TDep1, TDep2, TResult extends ReturnType<D[TKey]>>(
  //   key: TKey,
  //   fn: (d1: TDep1, d2: TDep2) => TResult,
  //   depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1],
  // ): Module<I, D, AD, C>;
  // replaceFunction<TKey extends keyof D, TDep1, TDep2, TResult extends ReturnType<D[TKey]>>(
  //   key: TKey,
  //   fn: (d1: TDep1, d2: TDep2) => TResult,
  //   depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1, TDep2],
  // ): Module<I, D, AD, C>;
  // // 3 args
  // replaceFunction<TKey extends keyof D, TDep1, TDep2, TDep3, TResult extends ReturnType<D[TKey]>>(
  //   key: TKey,
  //   fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  // ): Module<I, D, AD, C>;
  // replaceFunction<TKey extends keyof D, TDep1, TDep2, TDep3, TResult extends ReturnType<D[TKey]>>(
  //   key: TKey,
  //   fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  //   depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1],
  // ): Module<I, D, AD, C>;
  // replaceFunction<TKey extends keyof D, TDep1, TDep2, TDep3, TResult extends ReturnType<D[TKey]>>(
  //   key: TKey,
  //   fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  //   depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1, TDep2],
  // ): Module<I, D, AD, C>;
  // replaceFunction<TKey extends keyof D, TDep1, TDep2, TDep3, TResult extends ReturnType<D[TKey]>>(
  //   key: TKey,
  //   fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  //   depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1, TDep2, TDep3],
  // ): Module<I, D, AD, C>;
  // replaceFunction(key, fn, depSelect?): any {
  //   const curried = curry(fn);
  //   const select = depSelect ? depSelect : () => [];
  //   // TODO: container => {...} should be wrapped in some concrete DependencyResolver instance (.e.g CurriedFunctionResolver)
  //   return this.replace(key, container => {
  //     const params = select(container);
  //     if (params.length === fn.length) {
  //       return () => fn(...params);
  //     } else {
  //       return curried(...params);
  //     }
  //   });
  // }

  // TODO: since we don't provide replace for function, we shouldn't also provide replace for class
  // replaceClass<TKey extends keyof D, TResult extends D[TKey]>(
  //     key: TKey,
  //     klass: ClassType<[], TResult>,
  // ): Module<I, D, AD, C>;
  // replaceClass<TKey extends keyof D, TDeps extends any[], TResult extends D[TKey]>(
  //     key: TKey,
  //     klass: ClassType<TDeps, TResult>,
  //     depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => TDeps,
  // ): Module<I, D, AD, C>;
  // replaceClass<TKey extends keyof D, TDeps extends any[], TResult extends D[TKey]>(
  //     key: TKey,
  //     klass: ClassType<TDeps, TResult>,
  //     depSelect?: (ctx: MaterializedModuleEntries<I, D, AD>) => TDeps,
  // ): Module<I, D, AD, C> {
  //   return this.replace(key as any, container => {
  //     const selectDeps = depSelect ? depSelect : () => [];
  //     return new klass(...(selectDeps(container) as any)) as any;
  //   });
  // }

  defineAsync<K extends string, V, C1>(
    key: K,
    factory: (ctx: DefineAsyncContext<I, D, AD>) => Promise<V>,
  ): ModuleWithNextAsyncDefinition<K, V, C1, I, D, AD, C> {
    return new Module(
      this.definitions.extendAsyncDeclarations(key, AsyncDependencyDefinition.build(factory) as any),
    ) as any;
  }

  // TODO: rename -> replaceModule() ?
  // TODO: make sure that inject replaces all module occurrences - given module can be imported many times - write specs
  inject<D1, AD1 extends AsyncDefinitionsRecord, I1 extends ImportsRecord, C1>(
    otherModule: Module<I1, D1, AD1, C1>,
  ): Module<I, D, AD, C> {
    return new Module(this.definitions.inject(otherModule.entries));
  }

  replace<K extends keyof D, C>(
    key: K,
    factory: (container: MaterializedModuleEntries<I, D, AD>, C) => FilterPrivateFields<D[K]>,
  ): Module<I, D, AD, C> {
    return this.undeclare(key).define(key as any, factory as any) as any;
  }

  // convenient method for providing mocks for testing
  replaceConst<K extends keyof D, C>(key: K, value: D[K]): Module<I, D, AD, C> {
    return this.undeclare(key).define(key as any, () => value) as any;
  }

  //TODO: should be private. because it breaks typesafety when module is nested? ()
  undeclare<K extends keyof D>(key: K): Module<I, Omit<D, K>, AD, C> {
    return new Module(this.definitions.removeDeclaration(key)) as any;
  }

  import<K extends string, I1 extends ImportsRecord, D1 extends DefinitionsRecord, AD1 extends AsyncDefinitionsRecord>(
    key: K,
    mod2: Thunk<Module<I1, D1, AD1>>,
  ): ModuleWithImport<K, I1, D1, AD1, I, D, AD, C> {
    return new Module(this.definitions.extendImports(key, unwrapThunk(mod2).definitions)) as any;
  }

  toContainer(ctx: C): Container<I, D, AD> {
    return new Container(this.entries, ctx);
  }

  async buildAsyncContainer(ctx: C): Promise<Container<I, D, AD, C>> {
    return new Container(this.entries, ctx);
  }
}

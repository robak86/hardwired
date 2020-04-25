import { Thunk, unwrapThunk } from './utils/thunk';
import {
  AsyncDefinitionsRecord,
  DefinitionsRecord,
  ImportsRecord,
  MaterializedModuleEntries,
  ModuleEntries,
} from './module-entries';
import { Container } from './Container';
import { DependencyResolver } from './DependencyResolver';
import { GlobalSingletonResolver } from './resolvers/global-singleton-resolver';
import { ModuleId } from './module-id';
import { AsyncDependencyDefinition } from './utils/async-dependency-resolver';
import { curry } from './utils/curry';

/*
TODO: refactor plan

* extract all complex types to separate types/interfaces
* define class methods as properties
* Add typesafety checks (look at the omni type library)

someMethod: ExtractedComplexType = (p1,p2,p3) => {

}


* make Module inherit from Immutable base class ./look at the immutable directory examples!

 */

class Test {}

type FilterPrivateFields<T> = {
  [K in keyof T]: T[K];
};

export type ModuleContext<M> = M extends Module<any, any, any, infer CTX> ? CTX : never;

export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never
  ? RETURN
  : 'Module contains duplicated definitions';

//TODO: .defineAsync should return AsyncModule! (container(...) should accept only Module asyncContainer(...) should accept AsyncModule)
//TODO: .import() should return AsyncModule if imported module is async

interface Defineable<I extends ImportsRecord, D extends DefinitionsRecord, AD extends AsyncDefinitionsRecord, C> {
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
  ): ModuleWithNextDefinition<K, V, C1, I, D, AD, C>;
}

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
> implements Defineable<I, D, AD, C> {
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
    depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1, TDep2],
  ): ModuleWithNextDefinition<TKey, () => TResult, C, I, D, AD, C>;
  defineFunction<TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<I, D, AD>) => [TDep1],
  ): ModuleWithNextDefinition<TKey, (dep2: TDep2) => TResult, C, I, D, AD, C>;
  defineFunction(key, fn, depSelect?): any {
    const curried = curry(fn);
    const select = depSelect ? depSelect : () => [];
    return this.define(key, container => {
      const params = select(container);
      if (params.length === fn.length) {
        return () => fn(...params);
      } else {
        return curried(...params);
      }
    });
  }

  defineAsync<K extends string, V, C1>(
    key: K,
    factory: (ctx: DefineAsyncContext<I, D, AD>) => Promise<V>,
  ): ModuleWithNextAsyncDefinition<K, V, C1, I, D, AD, C> {
    return new Module(
      this.definitions.extendAsyncDeclarations(key, AsyncDependencyDefinition.build(factory) as any),
    ) as any;
  }

  //TODO: make sure that inject replaces all module occurrences - given module can be imported many times - write specs
  inject<D1, AD1 extends AsyncDefinitionsRecord, I1 extends ImportsRecord, C1>(
    otherModule: Module<I1, D1, AD1, C1>,
  ): Module<I, D, AD, C> {
    return new Module(this.definitions.inject(otherModule.entries));
  }

  replace<K extends keyof D, C>(
    key: K,
    factory: (container: MaterializedModuleEntries<I, D, AD>, C) => FilterPrivateFields<D[K]>,
  ): Module<I, D, AD, C> {
    return this.undeclare(key).define(key as any, factory) as any;
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

import { Thunk, unwrapThunk } from "./utils/thunk";
import {
  AsyncDeclarationsFactories,
  AsyncDependenciesRegistry,
  DeclarationsFactories,
  DependenciesRegistry,
  ImmutableSet,
  ImportsRegistry,
  MaterializedModuleEntries,
  ModuleEntries,
} from "./module-entries";
import { Container } from "./Container";
import { DependencyResolver } from "./DependencyResolver";
import { GlobalSingletonResolver } from "./resolvers/global-singleton-resolver";
import { ModuleId } from "./module-id";

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

// interface Class<T> {
//   constructor(): T;
// }
//
// type ClassRef = new (...args: any[]) => any;
//
// export interface Type extends Function {
//   new (...args: any[]): any;
// }
//
// type ZZZ = InstanceType<any>;
// type ClassOrFunction<T> = T extends new (...args: any) => T
//   ? "class"
//   : "function";
//
// type Fun = () => null;
//
// type Check = ClassOrFunction<Zygmunt>;

export type ModuleContext<M> = M extends Module<any, any, any, infer CTX>
  ? CTX
  : never;

export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never
  ? RETURN
  : never;

//TODO: .defineAsync should return AsyncModule! (container(...) should accept only Module asyncContainer(...) should accept AsyncModule)
//TODO: .import() should return AsyncModule if imported module is async

type ModuleWithDefinition<
  K extends string,
  V,
  C1,
  I extends ImportsRegistry,
  D extends DependenciesRegistry,
  AD extends AsyncDependenciesRegistry,
  C
> = NotDuplicated<K, D, Module<I, D & Record<K, V>, AD, C & C1>>;

type ModuleWithAsyncDefinition<
  K extends string,
  V,
  C1,
  I extends ImportsRegistry,
  D extends DependenciesRegistry,
  AD extends AsyncDependenciesRegistry,
  C
> = NotDuplicated<K, D, Module<I, D, AD & Record<K, V>, C & C1>>;

type ModuleWithImport<
  K extends string,
  I1 extends ImportsRegistry,
  D1 extends DependenciesRegistry,
  AD1 extends AsyncDependenciesRegistry,
  I extends ImportsRegistry,
  D extends DependenciesRegistry,
  AD extends AsyncDependenciesRegistry,
  C
> = NotDuplicated<
  K,
  I,
  Module<I & Record<K, Thunk<ModuleEntries<I1, D1, AD1>>>, D, AD, C>
>;

type DefineAsyncContext<
  I extends ImportsRegistry,
  D extends DependenciesRegistry,
  AD extends AsyncDependenciesRegistry
> = MaterializedModuleEntries<I, D, AD>;

export class Module<
  I extends ImportsRegistry = {},
  D extends DependenciesRegistry = {},
  AD extends AsyncDependenciesRegistry = {},
  C = {}
> {
  // private readonly moduleId:ModuleId;
  // private readonly imports:I;
  // private readonly declarations:DeclarationsFactories<D>;
  // private readonly asyncDeclarations:AsyncDeclarationsFactories<I, D, AD>;

  constructor(
    private readonly moduleId: ModuleId,
    private readonly imports: ImmutableSet<I>,
    private readonly declarations: ImmutableSet<DeclarationsFactories<D>>,
    private readonly asyncDeclarations: ImmutableSet<
      AsyncDeclarationsFactories<I, D, AD>
    >
  ) {}

  get entries(): ModuleEntries<I, D, AD> {
    return {
      moduleId: this.moduleId,
      imports: this.imports,
      declarations: this.declarations,
      asyncDeclarations: this.asyncDeclarations,
    };
  }

  // TODO make constructor to accept partial object with moduleId, declarations, etc.

  hasModule(key: keyof I): boolean {
    return this.imports.hasKey(key);
  }

  isDeclared(key: keyof D): boolean {
    return this.declarations.hasKey(key);
  }

  // function(){
  //
  // }

  // TODO: conditional types doesn't allow to check if type is a constructor or function. The same at the runtime
  // We need two separate methods
  // It enables to implements api lik
  /*
    .defineClass('name', SomeClass, _ => [_.dep1, _.dep2])    // returns class instance
    .defineFunction('name', SomeFunction, _ => [_.dep1, _.dep2]) // returns curried function
   */
  define<K extends string, V, C1>(
    key: K,
    factory: DependencyResolver<MaterializedModuleEntries<I, D, AD>, V>
  ): ModuleWithDefinition<K, V, C1, I, D, AD, C>;
  define<K extends string, V, C1>(
    key: K,
    factory: (container: MaterializedModuleEntries<I, D, AD>, ctx: C1) => V
  ): ModuleWithDefinition<K, V, C1, I, D, AD, C>;
  define<K extends string, V, C1>(
    key: K,
    factory:
      | DependencyResolver<MaterializedModuleEntries<I, D, AD>, V>
      | ((container: MaterializedModuleEntries<I, D, AD>, ctx: C1) => V)
  ): ModuleWithDefinition<K, V, C1, I, D, AD, C> {
    const resolver =
      typeof factory === "function"
        ? new GlobalSingletonResolver(factory)
        : factory;

    // let cloned = new Module(ModuleEntries.define(key, resolver)(this.entries));
    // return cloned as any;
    return new Module(
      ModuleId.next(this.moduleId),
      this.imports,
      this.declarations.extend(key, resolver) as any,
      this.asyncDeclarations
    ) as any; //TODO: fix types
  }

  //container:, ctx:C1

  // defineV2<K extends string, V, C1>(key:K, resolver:Resolver<MaterializedModuleEntries<I, D, AD>, V>):ModuleWithDefinition<K, V, C1, I, D, AD, C> {
  //     let cloned = new Module(ModuleEntries.define(key, factory)(this.entries));
  //     return cloned as any;
  // }

  defineAsync<K extends string, V, C1>(
    key: K,
    factory: (ctx: DefineAsyncContext<I, D, AD>) => Promise<V>
  ): ModuleWithAsyncDefinition<K, V, C1, I, D, AD, C> {
    return this.appendDefinition(
      this.imports, // breakme
      this.declarations,
      this.asyncDeclarations.set(key, factory as any)
    );
  }

  //TODO: make sure that inject replaces all module occurrences - given module can be imported many times - write specs
  inject<
    D1,
    AD1 extends AsyncDependenciesRegistry,
    I1 extends ImportsRegistry,
    C1
  >(otherModule: Module<I1, D1, AD1, C1>): Module<I, D, AD, C> {
    const nextImports = this.imports.mapValues((importedModule: any) => {
      const unwrappedImportedModule = unwrapThunk(importedModule);
      return unwrappedImportedModule.isEqual(otherModule)
        ? otherModule
        : unwrappedImportedModule.inject(otherModule);
    });

    return this.appendDefinition(
      nextImports,
      this.declarations,
      this.asyncDeclarations
    );
  }

  replace<K extends keyof D, C>(
    key: K,
    factory: (
      container: MaterializedModuleEntries<I, D, AD>,
      C
    ) => FilterPrivateFields<D[K]>
  ): Module<I, D, AD, C> {
    return this.undeclare(key).define(key as any, factory) as any;
  }

  //TODO: should be private. because it breaks typesafety when module is nested? ()
  undeclare<K extends keyof D>(key: K): Module<I, Omit<D, K>, AD, C> {
    return this.appendDefinition(
      this.imports,
      this.declarations.remove(key) as any, // TODO
      this.asyncDeclarations
    );
  }

  getEntries = () => {
    return this.entries;
  };

  import<
    K extends string,
    I1 extends ImportsRegistry,
    D1 extends DependenciesRegistry,
    AD1 extends AsyncDependenciesRegistry
  >(
    key: K,
    mod2: Thunk<Module<I1, D1, AD1>>
  ): ModuleWithImport<K, I1, D1, AD1, I, D, AD, C> {
    return this.appendDefinition(
      this.imports.set(key, unwrapThunk(mod2) as any),
      this.declarations,
      this.asyncDeclarations
    );
  }

  isEqual(other: Module<any, any, any>): boolean {
    return this.moduleId.identity === other.moduleId.identity;
  }

  buildContainer(ctx: C): Container<I, D, AD> {
    return new Container(this.entries, ctx);
  }

  async buildAsyncContainer(ctx: C): Promise<Container<I, D, AD, C>> {
    return new Container(this.entries, ctx);
  }

  // TODO: fix types (TNextAd seems to be wrong)
  private appendDefinition<
    TNextI extends ImmutableSet<I>,
    TNextD extends ImmutableSet<DeclarationsFactories<D>>,
    TNextAD extends ImmutableSet<AsyncDeclarationsFactories<any, any, any>> // TODO: fix types
  >(imports: TNextI, declarations: TNextD, asyncDefinitions: TNextAD): any {
    return new Module(
      ModuleId.next(this.moduleId),
      imports,
      declarations,
      asyncDefinitions as any
    ) as any;
  }
}

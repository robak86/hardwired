import { DependencyResolver } from '../resolvers/DependencyResolver';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { Thunk, unwrapThunk } from '../utils/thunk';
import { BaseModuleBuilder, Container } from '..';
import { DefinitionsSet } from './DefinitionsSet';
import { CurriedFunctionResolver } from '../resolvers/CurriedFunctionResolver';
import {
  MaterializedDefinitions,
  MaterializedModuleEntries,
  ModuleRegistry,
  ModuleRegistryDefinitions,
  ModuleRegistryDefinitionsKeys,
  ModuleRegistryImportsKeys,
  RequiresDefinition,
} from './ModuleRegistry';
import {
  ClassType,
  FilterPrivateFields,
  NextModuleDefinition,
  NextModuleImport,
  NotDuplicatedKeys,
} from './ModuleUtils';
import { ModuleBuilder } from '../builders/ModuleBuilder';

// TODO: extends BaseModule throws error (some circular dependencies makes BaseModule to be undefined)
export class Module<R extends ModuleRegistry> {
  public debug!: R;

  constructor(public readonly registry: DefinitionsSet<R>) {}

  using<TNextBuilder extends ModuleBuilder<R>>(builderFactory: (ctx: DefinitionsSet<R>) => TNextBuilder): TNextBuilder {
    return builderFactory(this.registry);
  }

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

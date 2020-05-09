import { DependencyResolver } from '../resolvers/DependencyResolver';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { Thunk, unwrapThunk } from '../utils/thunk';

import { DefinitionsSet } from './DefinitionsSet';

import {
  MaterializedDefinitions,
  MaterializedModuleEntries,
  ModuleRegistry,
  ModuleRegistryDefinitions,
  ModuleRegistryDefinitionsKeys,
  RequiresDefinition,
} from './ModuleRegistry';
import { FilterPrivateFields, NextModuleDefinition, NextModuleImport, NotDuplicatedKeys } from './ModuleUtils';
import { BaseModuleBuilder } from '../builders/BaseModuleBuilder';

// TODO: extends BaseModule throws error (some circular dependencies makes BaseModule to be undefined)
export class Module<R extends ModuleRegistry> extends BaseModuleBuilder<R> {
  public debug!: R;

  constructor(registry: DefinitionsSet<R>) {
    super(registry);
  }

  protected build<TNextBuilder extends this>(ctx: any): TNextBuilder {
    return new Module(ctx) as any;
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
    const resolver = typeof factory === 'function' ? new GlobalSingletonResolver(factory as any) : factory;
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
export function module<CTX = {}>(name: string): Module<{}> {
  return new Module(DefinitionsSet.empty(name));
}

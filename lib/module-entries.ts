import { Thunk, UnwrapThunk } from "./utils/thunk";
import { ModuleId } from "./module-id";
import { AsyncDependencyDefinition } from "./utils/async-dependency-resolver";
import { DependencyResolver } from "./DependencyResolver";
import { NotDuplicated } from "./module";

export class ImmutableSet<D extends Record<string, any>> {
  static empty(): ImmutableSet<{}> {
    return new ImmutableSet<{}>({});
  }

  private constructor(private records: D) {}

  get<K extends keyof D>(key: K): D[K] {
    return this.records[key];
  }

  hasKey(key: any): boolean {
    return !!this.records[key];
  }

  get values(): Array<D[keyof D]> {
    return Object.values(this.records);
  }

  get keys(): Array<keyof D> {
    return Object.keys(this.records);
  }

  // get entries(): D {
  //   return { ...this.records };
  // }

  remove<TKey extends keyof D>(key: TKey): ImmutableSet<Omit<D, TKey>> {
    const cloned: D = { ...this.records };
    delete cloned[key];
    return new ImmutableSet(cloned) as any;
  }

  set<TKey extends keyof D, TValue extends D[TKey]>(
    key: TKey,
    value: TValue
  ): ImmutableSet<D> {
    return new ImmutableSet({
      ...this.records,
      [key]: value,
    });
  }

  mapValues<TNext>(mapFn: (value: D[keyof D]) => TNext): ImmutableSet<TNext> {
    const next: any = {};
    this.keys.forEach((key) => {
      next[key] = mapFn(this.get(key));
    });

    return new ImmutableSet(next);
  }

  // extend<TKey extends string, TValue>(
  //   key: TKey,
  //   value: TValue
  // ): NotDuplicated<
  //   TKey,
  //   TValue,
  //   ImmutableSet<D & { [K in keyof TKey]: TValue }>
  // > {
  //   return new ImmutableSet({
  //     ...this.records,
  //     [key]: value,
  //   }) as any;
  // }

  extend<TKey extends string, TValue>(
    key: TKey,
    value: TValue
  ): ImmutableSet<D & { [K in TKey]: TValue }> {
    return new ImmutableSet({
      ...this.records,
      [key]: value,
    });
  }
}

const a = ImmutableSet.empty().extend("1", 12).extend("2", "sdf");

a.mapValues((val) => {});

export type FactoryFunction<
  I extends ImportsRegistry = any,
  D extends DependenciesRegistry = any,
  AD extends AsyncDependenciesRegistry = any
> = (ctx: MaterializedModuleEntries<I, D, AD>) => any;

export type AsyncFactoryFunction<
  I extends ImportsRegistry,
  D extends DependenciesRegistry,
  AD extends AsyncDependenciesRegistry
> = (ctx: AsyncMaterializedModuleEntries<I, D, AD>) => Promise<any>;

export type DeclarationsFactories<D> = {
  [K in keyof D]: DependencyResolver<any, any, D>;
};

export type AsyncDeclarationsFactories<
  I extends ImportsRegistry,
  D extends DependenciesRegistry,
  AD extends AsyncDependenciesRegistry
> = {
  [K in keyof I]: AsyncDependencyDefinition<I, D, AD>;
};

export type ImportsRegistry = Record<string, Thunk<ModuleEntries<any, any>>>;
export type DependenciesRegistry = Record<string, any>;
export type AsyncDependenciesRegistry = Record<string, any>;

export type PromiseWrappedAsyncDependencies<
  T extends AsyncDependenciesRegistry
> = {
  [K in keyof T]: () => Promise<T[K]>;
};

// export type MaterializeAsyncDependencies<AD extends AsyncDependenciesRegistry> = {
//     [K in keyof AD]:UnwrapPromise<ReturnType<AD[K]['resolver']>>
// }

export type ModuleEntriesDependencies<
  D extends DependenciesRegistry,
  AD extends AsyncDependenciesRegistry
> = D & AD;

export type MaterializedModuleEntries<
  I extends ImportsRegistry,
  D extends DependenciesRegistry,
  AD extends AsyncDependenciesRegistry
> = AD &
  D &
  {
    [K in keyof I]: MaterializedModuleEntries<
      {},
      {},
      ExtractModuleRegistryDeclarations<UnwrapThunk<I[K]>>
    >;
  };

export type AsyncMaterializedModuleEntries<
  I extends ImportsRegistry,
  D extends DependenciesRegistry,
  AD extends AsyncDependenciesRegistry
> = PromiseWrappedAsyncDependencies<AD> &
  D &
  {
    [K in keyof I]: MaterializedModuleEntries<
      {},
      {},
      ExtractModuleRegistryDeclarations<UnwrapThunk<I[K]>>
    >;
  };

export type ExtractModuleRegistryDeclarations<
  M extends ModuleEntries
> = M extends ModuleEntries<any, infer D, infer AD>
  ? ModuleEntriesDependencies<D, AD>
  : never;

// TODO: maybe this should be a class ? providing convenience methods for cloning (with partially setting of properties) ?
export type ModuleEntries<
  I extends ImportsRegistry = any,
  D extends DependenciesRegistry = any,
  AD extends AsyncDependenciesRegistry = any
> = {
  moduleId: ModuleId;
  imports: ImmutableSet<I>;
  declarations: ImmutableSet<DeclarationsFactories<D>>;
  asyncDeclarations: ImmutableSet<AsyncDeclarationsFactories<I, D, AD>>;
};
//
// export const ModuleEntrie2s = {
//   build(name: string): ModuleEntries {
//     return {
//       moduleId: ModuleId.build(name),
//       imports: {},
//       declarations: {},
//       asyncDeclarations: {},
//     };
//   },
//
//   hasModule(key: string, entries: ModuleEntries): boolean {
//     return !!entries.imports[key];
//   },
//
//   hasDefinition(key: string, entries: ModuleEntries): boolean {
//     return !!entries.declarations[key];
//   },
//
//   hasOwnAsyncDefinition(entries: ModuleEntries): boolean {
//     return Object.keys(entries.asyncDeclarations).length > 0;
//   },
//
//   hasAsyncDefinitions(entries: ModuleEntries): boolean {
//     return (
//       ModuleEntries.hasAsyncDefinitions(entries) ||
//       Object.values(
//         entries.imports
//       ).some((moduleEntries: Thunk<ModuleEntries>) =>
//         ModuleEntries.hasAsyncDefinitions(unwrapThunk(moduleEntries))
//       )
//     );
//   },
//
//   //TODO: use assoc, assoc path or something
//   define<
//     K extends string,
//     I extends ImportsRegistry,
//     D extends DependenciesRegistry,
//     AD extends AsyncDependenciesRegistry,
//     O
//   >(
//     key: K,
//     factory: DependencyResolver<MaterializedModuleEntries<I, D, AD>, any, O>
//   ) {
//     return (
//       module: ModuleEntries<I, D>
//     ): ModuleEntries<I, D & Record<K, O>, AD> => {
//       return {
//         moduleId: ModuleId.next(module.moduleId),
//         imports: shallowClone(module.imports),
//         declarations: assoc(key, factory, module.declarations),
//         asyncDeclarations: shallowClone(module.asyncDeclarations),
//       };
//     };
//   },
//
//   defineAsync<
//     K extends string,
//     I extends ImportsRegistry,
//     D extends DependenciesRegistry,
//     AD extends AsyncDependenciesRegistry,
//     O extends AsyncFactoryFunction<I, D, AD>
//   >(key: K, factory: O) {
//     return (
//       module: ModuleEntries<I, D>
//     ): ModuleEntries<I, D, AD & Record<K, O>> => {
//       return {
//         moduleId: ModuleId.next(module.moduleId),
//         imports: shallowClone(module.imports),
//         declarations: shallowClone(module.declarations),
//         asyncDeclarations: assoc(
//           key,
//           AsyncDependencyDefinition.build(factory),
//           module.asyncDeclarations
//         ),
//       };
//     };
//   },
//
//   inject(otherModule: ModuleEntries, entries: ModuleEntries): ModuleEntries {
//     return {
//       moduleId: ModuleId.next(entries.moduleId),
//       declarations: shallowClone(entries.declarations),
//       imports: mapValues(entries.imports, (module) => {
//         return unwrapThunk(module).moduleId.identity ===
//           unwrapThunk(otherModule).moduleId.identity //todo implement isEqual
//           ? otherModule
//           : ModuleEntries.inject(otherModule, unwrapThunk(module));
//       }),
//       asyncDeclarations: shallowClone(entries.asyncDeclarations),
//     };
//   },
//
//   undefine<
//     I extends ImportsRegistry,
//     D extends DependenciesRegistry,
//     K extends keyof D
//   >(key: K, entries: ModuleEntries<I, D>): ModuleEntries<I, Omit<D, K>> {
//     return {
//       moduleId: ModuleId.next(entries.moduleId),
//       imports: shallowClone(entries.imports),
//       declarations: dissoc(key as any, entries.declarations) as any,
//       asyncDeclarations: shallowClone(entries.asyncDeclarations),
//     };
//   },
//
//   import<
//     K extends string,
//     I extends ImportsRegistry,
//     D extends DependenciesRegistry,
//     AD extends AsyncDependenciesRegistry,
//     M2 extends ModuleEntries
//   >(key: K, otherModule: Thunk<M2>) {
//     return (
//       module: ModuleEntries<I, D>
//     ): ModuleEntries<I & Record<K, Thunk<M2>>, D, AD> => {
//       return {
//         moduleId: ModuleId.next(module.moduleId),
//         imports: assoc(key, otherModule, module.imports),
//         declarations: shallowClone(module.declarations),
//         asyncDeclarations: shallowClone(module.asyncDeclarations),
//       };
//     };
//   },
// };

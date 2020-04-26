import { Thunk, unwrapThunk, UnwrapThunk } from '../utils/thunk';
import { ModuleId } from '../module-id';
import { AsyncDependencyDefinition } from '../utils/async-dependency-resolver';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { ImmutableSet } from '../ImmutableSet';

export type FactoryFunction<
  I extends ImportsRecord = any,
  D extends DefinitionsRecord = any,
  AD extends AsyncDefinitionsRecord = any
> = (ctx: MaterializedModuleEntries<I, D, AD>) => any;

export type AsyncFactoryFunction<
  I extends ImportsRecord,
  D extends DefinitionsRecord,
  AD extends AsyncDefinitionsRecord
> = (ctx: AsyncMaterializedModuleEntries<I, D, AD>) => Promise<any>;

export type DeclarationsFactories<D> = {
  [K in keyof D]: DependencyResolver<any, any, D>;
};

export type AsyncDeclarationsFactories<
  I extends ImportsRecord,
  D extends DefinitionsRecord,
  AD extends AsyncDefinitionsRecord
> = {
  [K in keyof I]: AsyncDependencyDefinition<I, D, AD>;
};

export type ImportsRecord = Record<string, Thunk<ModuleEntries<any, any>>>;
export type DefinitionsRecord = Record<string, any>;
export type AsyncDefinitionsRecord = Record<string, any>;

export type PromiseWrappedAsyncDependencies<T extends AsyncDefinitionsRecord> = {
  [K in keyof T]: () => Promise<T[K]>;
};

// export type MaterializeAsyncDependencies<AD extends AsyncDependenciesRegistry> = {
//     [K in keyof AD]:UnwrapPromise<ReturnType<AD[K]['resolver']>>
// }

export type ModuleEntriesDependencies<D extends DefinitionsRecord, AD extends AsyncDefinitionsRecord> = D & AD;

export type MaterializedModuleEntries<
  I extends ImportsRecord,
  D extends DefinitionsRecord,
  AD extends AsyncDefinitionsRecord
> = AD &
  D &
  {
    [K in keyof I]: MaterializedModuleEntries<{}, {}, ExtractModuleRegistryDeclarations<UnwrapThunk<I[K]>>>;
  };

export type AsyncMaterializedModuleEntries<
  I extends ImportsRecord,
  D extends DefinitionsRecord,
  AD extends AsyncDefinitionsRecord
> = PromiseWrappedAsyncDependencies<AD> &
  D &
  {
    [K in keyof I]: MaterializedModuleEntries<{}, {}, ExtractModuleRegistryDeclarations<UnwrapThunk<I[K]>>>;
  };

export type ExtractModuleRegistryDeclarations<M extends ModuleEntries> = M extends ModuleEntries<any, infer D, infer AD>
  ? ModuleEntriesDependencies<D, AD>
  : never;

type ImportedModulesRecord = Record<string, Thunk<ModuleEntries<any, any, any>>>;

export class ModuleEntries<
  I extends ImportedModulesRecord = any,
  D extends DefinitionsRecord = any,
  AD extends AsyncDefinitionsRecord = any
> {
  static empty(name: string): ModuleEntries {
    return new ModuleEntries<any, any, any>(
      ModuleId.build(name),
      ImmutableSet.empty(),
      ImmutableSet.empty(),
      ImmutableSet.empty(),
    );
  }

  protected constructor(
    public moduleId: ModuleId,
    public imports: ImmutableSet<I>,
    public declarations: ImmutableSet<DeclarationsFactories<D>>,
    public asyncDeclarations: ImmutableSet<AsyncDeclarationsFactories<I, D, AD>>,
  ) {}

  isEqual(other: ModuleEntries): boolean {
    return this.moduleId.identity === other.moduleId.identity;
  }

  extendImports(key, resolver) {
    return new ModuleEntries(
      ModuleId.next(this.moduleId),
      this.imports.extend(key, resolver) as any,
      this.declarations,
      this.asyncDeclarations,
    ) as any; //TODO: fix types
  }

  extendDeclarations(key, resolver) {
    return new ModuleEntries(
      ModuleId.next(this.moduleId),
      this.imports,
      this.declarations.extend(key, resolver) as any,
      this.asyncDeclarations,
    ) as any; //TODO: fix types
  }

  removeDeclaration(key) {
    return new ModuleEntries(
      ModuleId.next(this.moduleId),
      this.imports,
      this.declarations.remove(key) as any,
      this.asyncDeclarations,
    );
  }

  extendAsyncDeclarations(key, resolver) {
    return new ModuleEntries(
      ModuleId.next(this.moduleId),
      this.imports,
      this.declarations,
      this.asyncDeclarations.extend(key, resolver),
    ) as any; //TODO: fix types
  }

  inject(otherModule: ModuleEntries): ModuleEntries<I, D, AD> {
    const nextImports = this.imports.mapValues((importedModule: any) => {
      const unwrappedImportedModule = unwrapThunk(importedModule);
      return unwrappedImportedModule.isEqual(otherModule) ? otherModule : unwrappedImportedModule.inject(otherModule);
    });

    return new ModuleEntries(ModuleId.next(this.moduleId), nextImports, this.declarations, this.asyncDeclarations);
  }

  hasImport(key): boolean {
    return this.imports.hasKey(key);
  }

  hasDeclaration(key): boolean {
    return this.declarations.hasKey(key);
  }

  findModule(other: ModuleEntries) {
    let found = this.imports.values.map(unwrapThunk).find(m => m.isEqual(other));
    if (found) {
      return found;
    }

    for (let importKey in this.imports.keys) {
      const targetContainer = unwrapThunk(this.imports.get(importKey));
      let found = targetContainer.findModule(other);
      if (found) {
        return found;
      }
    }

    return undefined;
  }
}

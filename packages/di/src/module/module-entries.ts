import { Thunk, UnwrapThunk, unwrapThunk } from '../utils/thunk';
import { ModuleId } from '../module-id';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { ImmutableSet } from '../ImmutableSet';
import { Module } from './Module';


export type DeclarationsFactories<D> = {
  [K in keyof D]: DependencyResolver<any, any, D>;
};

export type ImportsRecord = Record<string, Thunk<ModuleEntries<any, any>>>;
export type DefinitionsRecord = Record<string, any>;



export type ExtractModuleRegistryDeclarations<M extends ModuleEntries> = M extends ModuleEntries<any, infer D>
  ? D
  : never;



type ImportedModulesRecord = Record<string, Thunk<ModuleEntries<any, any>>>;

export class ModuleEntries<I extends ImportedModulesRecord = any, D extends DefinitionsRecord = any, C = any> {
  static empty(name: string): ModuleEntries {
    return new ModuleEntries<any, any>(ModuleId.build(name), ImmutableSet.empty(), ImmutableSet.empty());
  }

  protected constructor(
    public moduleId: ModuleId,
    public imports: ImmutableSet<I>,
    public declarations: ImmutableSet<DeclarationsFactories<D>>,
  ) {}

  isEqual(other: ModuleEntries): boolean {
    return this.moduleId.identity === other.moduleId.identity;
  }

  extendImports(key, resolver) {
    return new ModuleEntries(
      ModuleId.next(this.moduleId),
      this.imports.extend(key, resolver) as any,
      this.declarations,
    ) as any; //TODO: fix types
  }

  extendDeclarations(key, resolver) {
    return new ModuleEntries(
      ModuleId.next(this.moduleId),
      this.imports,
      this.declarations.extend(key, resolver) as any,
    ) as any; //TODO: fix types
  }

  removeDeclaration(key) {
    return new ModuleEntries(ModuleId.next(this.moduleId), this.imports, this.declarations.remove(key) as any);
  }

  inject(otherModule: ModuleEntries): ModuleEntries<I, D> {
    const nextImports = this.imports.mapValues((importedModule: any) => {
      const unwrappedImportedModule = unwrapThunk(importedModule);
      return unwrappedImportedModule.isEqual(otherModule) ? otherModule : unwrappedImportedModule.inject(otherModule);
    });

    return new ModuleEntries(ModuleId.next(this.moduleId), nextImports, this.declarations);
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

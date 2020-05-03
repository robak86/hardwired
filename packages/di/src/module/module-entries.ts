import { unwrapThunk } from '../utils/thunk';
import { ModuleId } from '../module-id';
import { ImmutableSet } from '../ImmutableSet';
import { ModuleRegistry } from './Module';

export class DefinitionsSet<R extends ModuleRegistry, C = any> {
  static empty(name: string): DefinitionsSet<{}> {
    return new DefinitionsSet<any, any>(ModuleId.build(name), ImmutableSet.empty(), ImmutableSet.empty());
  }

  protected constructor(
    public moduleId: ModuleId,
    public imports: ImmutableSet<any>,
    public declarations: ImmutableSet<any>,
  ) {}

  isEqual(other: DefinitionsSet<any>): boolean {
    return this.moduleId.identity === other.moduleId.identity;
  }

  extendImports(key, resolver) {
    return new DefinitionsSet(
      ModuleId.next(this.moduleId),
      this.imports.extend(key, resolver) as any,
      this.declarations,
    ) as any; //TODO: fix types
  }

  extendDeclarations(key, resolver) {
    return new DefinitionsSet(
      ModuleId.next(this.moduleId),
      this.imports,
      this.declarations.extend(key, resolver) as any,
    ) as any; //TODO: fix types
  }

  removeDeclaration(key) {
    return new DefinitionsSet(ModuleId.next(this.moduleId), this.imports, this.declarations.remove(key) as any);
  }

  inject(otherModule: DefinitionsSet<any>): DefinitionsSet<any> {
    const nextImports = this.imports.mapValues((importedModule: any) => {
      const unwrappedImportedModule = unwrapThunk(importedModule);
      return unwrappedImportedModule.isEqual(otherModule) ? otherModule : unwrappedImportedModule.inject(otherModule);
    });

    return new DefinitionsSet(ModuleId.next(this.moduleId), nextImports, this.declarations);
  }

  hasImport(key): boolean {
    return this.imports.hasKey(key);
  }

  hasDeclaration(key): boolean {
    return this.declarations.hasKey(key);
  }

  findModule(other: DefinitionsSet<any>) {
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

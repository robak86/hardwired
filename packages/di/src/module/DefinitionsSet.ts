import { unwrapThunk } from '../utils/thunk';
import { ModuleId } from '../module-id';
import { ImmutableSet } from '../ImmutableSet';
import { MaterializedModuleEntries, ModuleRegistry, ModuleRegistryDefinitionsResolvers } from './ModuleRegistry';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { ContainerEvents } from '../container/ContainerEvents';

type RegistrySets<TRegistry extends ModuleRegistry> = ImmutableSet<{
  definition: ImmutableSet<ModuleRegistryDefinitionsResolvers<TRegistry>>;
  imports: ImmutableSet<Record<string, DefinitionsSet<any>>>;
  initializers: ImmutableSet<Record<string, any>>;
  events: ContainerEvents;
}>;

function initDefinitionSet<TRegistry extends ModuleRegistry>(): RegistrySets<TRegistry> {
  return ImmutableSet.empty()
    .extend('definition', ImmutableSet.empty())
    .extend('imports', ImmutableSet.empty())
    .extend('initializers', ImmutableSet.empty())
    .extend('events', new ContainerEvents()) as any;
}

// TODO: rename => RegistryEntries ? RegistrySet ... or even something better than Registry ?
export class DefinitionsSet<TRegistry extends ModuleRegistry, C = any> {
  static empty(name: string): DefinitionsSet<{}> {
    return new DefinitionsSet<any, any>(ModuleId.build(name), initDefinitionSet());
  }

  protected constructor(public moduleId: ModuleId, public data: RegistrySets<TRegistry> = initDefinitionSet()) {}

  isEqual(other: DefinitionsSet<any>): boolean {
    return this.moduleId.identity === other.moduleId.identity;
  }

  get declarations(): ImmutableSet<ModuleRegistryDefinitionsResolvers<TRegistry>> {
    return this.data.get('definition') as any;
  }

  get imports() {
    return this.data.get('imports');
  }

  get initializers() {
    return this.data.get('initializers');
  }

  get events(): ContainerEvents {
    return this.data.get('events');
  }

  extendImports(key, resolver) {
    return new DefinitionsSet(
      ModuleId.next(this.moduleId),
      this.data.update('imports', importsSet => importsSet.extend(key, resolver)),
    ) as any; //TODO: fix types
  }

  appendInitializer(key, initializer: (ctx: MaterializedModuleEntries<TRegistry>) => void) {
    return new DefinitionsSet(
      ModuleId.next(this.moduleId),
      this.data.updateWithDefaults('initializers', [] as any, initializersSet =>
        initializersSet.updateWithDefaults(key, [], initializers => [...initializers, initializer]),
      ),
    ) as any;
  }

  // TODO: extract to iterator ?
  forEachModule(iterFn: (registry: DefinitionsSet<any>) => void) {
    this.data.get('imports').reverse().forEach(importedRegistry => {
      importedRegistry.forEachModule(iterFn);
    });
    iterFn(this);
  }

  // TODO: extract to iterator ?
  forEachDefinition(iterFn: (resolver: DependencyResolver<any, any>) => void) {
    this.forEachModule(definitionsSet => {
      definitionsSet.declarations.reverse().forEach(iterFn);
    });
  }

  extendDeclarations<TKey extends string>(key: TKey, resolver: DependencyResolver<any, any>) {
    if (resolver.onRegister) {
      resolver.onRegister(this.events);
    }

    return new DefinitionsSet(
      ModuleId.next(this.moduleId),
      this.data.update('definition', definitionsSet => definitionsSet.extend(key, resolver) as any),
    ) as any; //TODO: fix types
  }

  // removeDeclaration(key) {
  //   return new DefinitionsSet(
  //     ModuleId.next(this.moduleId),
  //     this.imports,
  //     this.declarations.remove(key) as any,
  //     this.initializers,
  //   );
  // }

  inject(otherModule: DefinitionsSet<any>): DefinitionsSet<any> {
    const nextImports = this.data.update('imports', importsSet => {
      return importsSet.mapValues((importedModule: any) => {
        const unwrappedImportedModule = unwrapThunk(importedModule);
        return unwrappedImportedModule.isEqual(otherModule) ? otherModule : unwrappedImportedModule.inject(otherModule);
      });
    });

    return new DefinitionsSet(ModuleId.next(this.moduleId), nextImports);
  }

  hasImport(key): boolean {
    return this.data.get('imports').hasKey(key);
  }

  hasDeclaration(key): boolean {
    return this.data.get('definition').hasKey(key);
  }

  // TODO: extract to service ?
  findModule(other: DefinitionsSet<any>) {
    let found = this.data
      .get('imports')
      .values.map(unwrapThunk)
      .find(m => m.isEqual(other));

    if (found) {
      return found;
    }

    for (let importKey in this.data.get('imports').keys) {
      const targetContainer = unwrapThunk(this.data.get('imports').get(importKey));
      let found = targetContainer.findModule(other);
      if (found) {
        return found;
      }
    }

    return undefined;
  }
}

import { Thunk, unwrapThunk } from "../utils/thunk";
import { ModuleId } from "../module-id";
import { ImmutableSet } from "../ImmutableSet";
import { MaterializedModuleEntries, ModuleRegistryDefinitionsResolvers, RegistryRecord } from "./RegistryRecord";
import { DependencyResolver } from "../resolvers/DependencyResolver";
import { ContainerEvents } from "../container/ContainerEvents";

type RegistrySets<TRegistryRecord extends RegistryRecord> = ImmutableSet<{
  definition: ImmutableSet<ModuleRegistryDefinitionsResolvers<TRegistryRecord>>;
  // definition: ImmutableSet<Record<string, Definition<any>>>;
  imports: ImmutableSet<Record<string, Thunk<ModuleRegistry<any>>>>;
  initializers: ImmutableSet<Record<string, any>>;
  events: ContainerEvents;
}>;

function initDefinitionSet<TRegistryRecord extends RegistryRecord>(): RegistrySets<TRegistryRecord> {
  return ImmutableSet.empty()
    .extend('definition', ImmutableSet.empty())
    .extend('imports', ImmutableSet.empty())
    .extend('initializers', ImmutableSet.empty())
    .extend('events', new ContainerEvents()) as any;
}

// TODO: rename => RegistryEntries ? RegistrySet ... or even something better than Registry ?
export class ModuleRegistry<TRegistryRecord extends RegistryRecord, C = any> {
  static empty(name: string): ModuleRegistry<{}> {
    return new ModuleRegistry<any, any>(ModuleId.build(name), initDefinitionSet());
  }

  protected constructor(public moduleId: ModuleId, public data: RegistrySets<TRegistryRecord> = initDefinitionSet()) {}

  isEqual(other: ModuleRegistry<any>): boolean {
    return this.moduleId.identity === other.moduleId.identity;
  }

  get declarations(): ImmutableSet<ModuleRegistryDefinitionsResolvers<TRegistryRecord>> {
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

  extendImports(key, moduleRegistry: Thunk<ModuleRegistry<any>>) {
    return new ModuleRegistry(
      ModuleId.next(this.moduleId),
      this.data.update('imports', importsSet => importsSet.extend(key, moduleRegistry)),
    ) as any; //TODO: fix types
  }

  appendInitializer(key, initializer: (ctx: MaterializedModuleEntries<TRegistryRecord>) => void) {
    return new ModuleRegistry(
      ModuleId.next(this.moduleId),
      this.data.updateWithDefaults('initializers', [] as any, initializersSet =>
        initializersSet.updateWithDefaults(key, [], initializers => [...initializers, initializer]),
      ),
    ) as any;
  }

  // TODO: extract to iterator ?
  forEachModuleReversed(iterFn: (registry: ModuleRegistry<any>) => void) {
    this.data
      .get('imports')
      .reverse()
      .forEach(importedRegistry => {
        unwrapThunk(importedRegistry).forEachModuleReversed(iterFn);
      });
    iterFn(this);
  }

  // TODO: extract to iterator ?
  forEachDefinitionReversed(iterFn: (resolver: DependencyResolver<any, any>) => void) {
    this.forEachModuleReversed(moduleRegistry => {
      moduleRegistry.declarations.reverse().forEach(iterFn);
    });
  }

  forEachModule(iterFn: (registry: ModuleRegistry<any>) => void) {
    iterFn(this);
    this.data.get('imports').forEach(importedRegistry => {
      unwrapThunk(importedRegistry).forEachModule(iterFn);
    });
  }

  // TODO: extract to iterator ?
  forEachDefinition(iterFn: (resolver: DependencyResolver<any, any>, module: ModuleRegistry<any>) => void) {
    this.forEachModule(moduleRegistry => {
      moduleRegistry.declarations.forEach(resolver => iterFn(resolver, moduleRegistry));
    });
  }

  extendDeclarations<TKey extends string>(key: TKey, resolver: DependencyResolver<any, any>) {
    if (resolver.onRegister) {
      resolver.onRegister(this.events);
    }

    return new ModuleRegistry(
      ModuleId.next(this.moduleId),
      this.data.update('definition', moduleRegistry => moduleRegistry.extend(key, resolver) as any),
    ) as any; //TODO: fix types
  }

  // removeDeclaration(key) {
  //   return new ModuleRegistry(
  //     ModuleId.next(this.moduleId),
  //     this.imports,
  //     this.declarations.remove(key) as any,
  //     this.initializers,
  //   );
  // }

  inject(otherModule: ModuleRegistry<any>): ModuleRegistry<any> {
    const nextImports = this.data.update('imports', importsSet => {
      return importsSet.mapValues((importedModule: any) => {
        const unwrappedImportedModule = unwrapThunk(importedModule);
        return unwrappedImportedModule.isEqual(otherModule) ? otherModule : unwrappedImportedModule.inject(otherModule);
      });
    });

    return new ModuleRegistry(ModuleId.next(this.moduleId), nextImports);
  }

  hasImport(key): boolean {
    return this.data.get('imports').hasKey(key);
  }

  hasDeclaration(key): boolean {
    return this.data.get('definition').hasKey(key);
  }

  findResolvers<S extends DependencyResolver<any, any>>(
    filterFn: (value: DependencyResolver<any, any>) => value is S,
  ): S[] {
    const resolvers: S[] = [];

    this.forEachDefinition(resolver => {
      filterFn(resolver) && resolvers.push(resolver);
    });

    return resolvers;
  }

  // TODO: consider recursive approach (merge flattened resolvers from child modules)
  flattenResolvers(): Record<string, { resolver: DependencyResolver<any, any>; module: ModuleRegistry<any> }> {
    const resolvers = {};

    this.forEachDefinition((resolver, module) => {
      resolvers[resolver.id] = { resolver, module };
    });

    return resolvers;
  }

  findOwningModule(resolver: DependencyResolver<any, any>) {
    const resolvers = this.flattenResolvers();
    return resolvers[resolver.id]?.module;
  }

  hasResolver(resolver: DependencyResolver<any, any>) {
    this.declarations.find(registeredResolver => registeredResolver.id === resolver.id);
  }

  // TODO: extract to service ?
  findModule(other: ModuleRegistry<any>) {
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

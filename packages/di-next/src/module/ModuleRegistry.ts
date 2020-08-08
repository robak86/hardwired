// TODO: rename => RegistryEntries ? RegistrySet ... or even something better than Registry ?

// export class ModuleRegistry<TRegistryRecord extends RegistryRecord> extends ImmutableSet<TRegistryRecord> {}

import { ModuleId } from '../module-id';
import { ImmutableSet } from '../ImmutableSet';
import { RegistryRecord } from './RegistryRecord';
import { Thunk, unwrapThunk } from '../utils/thunk';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { AbstractRegistryDependencyResolver } from '../resolvers/AbstractDependencyResolver';
import { ContainerEvents } from '../container/ContainerEvents';

export class ModuleRegistry<TRegistryRecord, C = any> {
  static empty(name: string): ModuleRegistry<{}> {
    return new ModuleRegistry<any, any>(ModuleId.build(name));
  }

  protected constructor(
    public moduleId: ModuleId,
    public data: ImmutableSet<TRegistryRecord> = ImmutableSet.empty() as any,
    public events = new ContainerEvents(),
  ) {}

  isEqual(other: ModuleRegistry<any>): boolean {
    return this.moduleId.identity === other.moduleId.identity;
  }

  get resolvers() {
    return this.data;
  }

  append<TKey extends string, TResolver extends DependencyResolver<any>>(
    key: TKey,
    value: Thunk<TResolver>,
  ): ModuleRegistry<TRegistryRecord & Record<TKey, TResolver>> {
    return new ModuleRegistry<TRegistryRecord & Record<TKey, TResolver>>(
      ModuleId.next(this.moduleId),
      this.data.extend(key, value) as any,
      this.events,
    );
  }

  // extendImports(key, moduleRegistry: Thunk<ModuleRegistry<any>>) {
  //   return new ModuleRegistry(
  //     ModuleId.next(this.moduleId),
  //     this.data.update('imports', importsSet => importsSet.extend(key, moduleRegistry)),
  //   ) as any; //TODO: fix types
  // }

  // appendInitializer(key, initializer: (ctx: MaterializedModuleEntries<TRegistryRecord>) => void) {
  //   return new ModuleRegistry(
  //     ModuleId.next(this.moduleId),
  //     this.data.updateWithDefaults('initializers', [] as any, initializersSet =>
  //       initializersSet.updateWithDefaults(key, [], initializers => [...initializers, initializer]),
  //     ),
  //   ) as any;
  // }

  // TODO: extract to iterator ?
  forEachModuleReversed(iterFn: (registry: ModuleRegistry<any>) => void) {
    throw new Error('implement me');
    // this.data.reverse().forEach(importedRegistry => {
    //   const unwrappedResolver = unwrapThunk(importedRegistry);
    //   if (AbstractRegistryDependencyResolver.isComposite(unwrappedResolver)) {
    //     unwrappedResolver.registry.forEachModuleReversed(iterFn);
    //     iterFn(unwrappedResolver.registry);
    //   }
    // });
    // iterFn(this);
  }

  // TODO: extract to iterator ?
  forEachDefinitionReversed(iterFn: (resolver: DependencyResolver<any>) => void) {
    throw new Error('implement me');
    // this.resolvers.reverse().forEach(resolver => {
    //   const unwrappedResolver = unwrapThunk(resolver);
    //   if (AbstractRegistryDependencyResolver.isComposite(unwrappedResolver)) {
    //     unwrappedResolver.forEach(iterFn);
    //   } else {
    //     iterFn(unwrappedResolver);
    //   }
    // });
  }

  forEachModule(iterFn: (registry: ModuleRegistry<any>) => void) {
    throw new Error('implement me');
    iterFn(this);
    // this.data.reverse().forEach(importedRegistry => {
    //   const unwrappedResolver = unwrapThunk(importedRegistry);
    //   if (AbstractRegistryDependencyResolver.isComposite(unwrappedResolver)) {
    //     iterFn(unwrappedResolver.registry);
    //     unwrappedResolver.registry.forEachModuleReversed(iterFn);
    //   }
    // });
  }

  // TODO: extract to iterator ?
  forEachDefinition(iterFn: (resolver: DependencyResolver<any>) => void) {
    throw new Error('implement me');
    // this.resolvers.forEach(resolver => {
    //   const unwrappedResolver = unwrapThunk(resolver);
    //   if (AbstractRegistryDependencyResolver.isComposite(unwrappedResolver)) {
    //     unwrappedResolver.forEach(iterFn);
    //   } else {
    //     iterFn(unwrappedResolver);
    //   }
    // });
  }

  extendDeclarations<TKey extends string>(key: TKey, resolver: DependencyResolver<any>) {
    // if (resolver.onRegister) {
    //   resolver.onRegister(this.events);
    // }

    return new ModuleRegistry(ModuleId.next(this.moduleId), this.data.extend(key, resolver)) as any; //TODO: fix types
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
    throw new Error('Implement me');
    // const nextImports = this.data.update('imports', importsSet => {
    //   return importsSet.mapValues((importedModule: any) => {
    //     const unwrappedImportedModule = unwrapThunk(importedModule);
    //     return unwrappedImportedModule.isEqual(otherModule) ? otherModule : unwrappedImportedModule.inject(otherModule);
    //   });
    // });
    //
    // return new ModuleRegistry(ModuleId.next(this.moduleId), nextImports);
  }

  // hasImport(key): boolean {
  //   return this.resolver.hasKey(key);
  // }
  //
  // hasDeclaration(key): boolean {
  //   return this.data.get('definition').hasKey(key);
  // }

  findResolvers<S extends DependencyResolver<any>>(filterFn: (value: DependencyResolver<any>) => value is S): S[] {
    const resolvers: S[] = [];

    this.forEachDefinition(resolver => {
      filterFn(resolver) && resolvers.push(resolver);
    });

    return resolvers;
  }

  // TODO: consider recursive approach (merge flattened resolvers from child modules)
  flattenResolvers(): Record<string, { resolver: DependencyResolver<any>; module: ModuleRegistry<any> }> {
    // const resolvers = {};
    //
    // this.forEachDefinition((resolver, module) => {
    //   resolvers[resolver.id] = { resolver, module };
    // });
    //
    // return resolvers;
    throw new Error('Implement me');
  }

  findOwningModule(resolver: DependencyResolver<any>) {
    const resolvers = this.flattenResolvers();
    return resolvers[resolver.id]?.module;
  }

  hasResolver(resolver: DependencyResolver<any>): boolean {
    // this.declarations.find(registeredResolver => registeredResolver.id === resolver.id);
    throw new Error('Implement me');
  }

  // TODO: extract to service ?
  findModule(other: ModuleRegistry<any>): any {
    throw new Error('Implement me');
    // let found = this.data
    //   .get('imports')
    //   .values.map(unwrapThunk)
    //   .find(m => m.isEqual(other));
    //
    // if (found) {
    //   return found;
    // }
    //
    // for (let importKey in this.data.get('imports').keys) {
    //   const targetContainer = unwrapThunk(this.data.get('imports').get(importKey));
    //   let found = targetContainer.findModule(other);
    //   if (found) {
    //     return found;
    //   }
    // }
    //
    // return undefined;
  }
}

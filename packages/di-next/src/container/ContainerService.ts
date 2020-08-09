import { RegistryRecord } from "../module/RegistryRecord";
import { DependencyResolver } from "../resolvers/DependencyResolver";
import { ModuleRegistry } from "../module/ModuleRegistry";
import { ContainerCache } from "./container-cache";
import { unwrapThunk } from "../utils/thunk";
import { AbstractModuleResolver } from "../resolvers/AbstractDependencyResolver";

export const ContainerService = {
  getChild<TRegistryRecord extends RegistryRecord>(
    registry: ModuleRegistry,
    cache: ContainerCache,
    context,
    dependencyKey: keyof TRegistryRecord,
  ) {
    // if (context && context[dependencyKey]) {
    //   return context[dependencyKey];
    // }
    //
    // if (registry.data.hasKey(dependencyKey)) {
    //   let declarationResolver: DependencyResolver<any> = unwrapThunk(registry.data.get(dependencyKey));
    //
    //   if (AbstractModuleResolver.isModuleResolver(declarationResolver)) {
    //     throw new Error('Implement me');
    //   } else {
    //     return declarationResolver.build(cache);
    //   }
    // }

    throw new Error(`Cannot find dependency for ${dependencyKey} key`);
  },

  proxyGetter(registry: ModuleRegistry, cache: ContainerCache, context) {
    return new Proxy({} as any, {
      get(target, property: string) {
        return ContainerService.getChild(registry, cache, context, property);
      },
    });
  },

  callDefinitionsListeners<TRegistryRecord extends RegistryRecord>(registry: ModuleRegistry) {
    // registry.forEachModule(moduleRegistry => {
    //   moduleRegistry.forEachDefinition(dependencyResolver => {
    //     moduleRegistry.events.onDefinitionAppend.emit(dependencyResolver);
    //     moduleRegistry.events.onSpecificDefinitionAppend.emit(dependencyResolver, moduleRegistry);
    //   });
    // });
  },

  // init(registry: ModuleRegistry<any>, cache: ContainerCache, context) {
  //   registry.forEachModuleReversed(registry => {
  //     if (cache.isModuleInitialized(registry.moduleId)) {
  //       return;
  //     }
  //
  //     // const moduleContainer = new Container(registry, cache);
  //     // registry.initializers.forEach(initializers =>
  //     //   initializers.forEach(init => {
  //     //     init(ContainerService.proxyGetter(registry, cache, context));
  //     //   }),
  //     // );
  //     cache.markModuleAsInitialized(registry.moduleId);
  //   });
  // },
};

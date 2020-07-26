import { RegistryRecord } from '../module/RegistryRecord';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { unwrapThunk } from '../utils/thunk';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ContainerCache } from './container-cache';

export const ContainerService = {
  getChild<TRegistryRecord extends RegistryRecord>(
    registry: ModuleRegistry<TRegistryRecord>,
    cache: ContainerCache,
    context,
    dependencyKey: keyof TRegistryRecord,
  ) {
    if (context && context[dependencyKey]) {
      return context[dependencyKey];
    }

    if (registry.declarations.hasKey(dependencyKey)) {
      let declarationResolver: DependencyResolver<any, any> = registry.declarations.get(dependencyKey);
      return declarationResolver.build(registry, cache, context);
    }

    if (registry.imports.hasKey(dependencyKey)) {
      let childModule = unwrapThunk(registry.imports.get(dependencyKey));
      return ContainerService.proxyGetter(childModule, cache, context);
    }

    throw new Error(`Cannot find dependency for ${dependencyKey} key`);
  },

  proxyGetter(registry: ModuleRegistry<any>, cache: ContainerCache, context) {
    return new Proxy({} as any, {
      get(target, property: string) {
        return ContainerService.getChild(registry, cache, context, property);
      },
    });
  },

  callDefinitionsListeners<TRegistryRecord extends RegistryRecord>(registry: ModuleRegistry<TRegistryRecord>) {
    registry.forEachModule(moduleRegistry => {
      moduleRegistry.forEachDefinition(dependencyResolver => {
        moduleRegistry.events.onDefinitionAppend.emit(dependencyResolver);
        moduleRegistry.events.onSpecificDefinitionAppend.emit(dependencyResolver, moduleRegistry);
      });
    });
  },

  init(registry: ModuleRegistry<any>, cache: ContainerCache, context) {
    registry.forEachModuleReversed(registry => {
      if (cache.isModuleInitialized(registry.moduleId)) {
        return;
      }

      // const moduleContainer = new Container(registry, cache);
      registry.initializers.forEach(initializers =>
        initializers.forEach(init => {
          init(ContainerService.proxyGetter(registry, cache, context));
        }),
      );
      cache.markModuleAsInitialized(registry.moduleId);
    });
  },
};

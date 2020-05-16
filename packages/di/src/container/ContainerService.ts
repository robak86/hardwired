import { ModuleRegistry } from '../module/ModuleRegistry';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { unwrapThunk } from '../utils/thunk';
import { proxyGetter } from './proxyGetter';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ContainerCache } from './container-cache';
import { Container } from './Container';

export const ContainerService = {
  getChild<TRegistry extends ModuleRegistry>(
    registry: DefinitionsSet<TRegistry>,
    cache: ContainerCache,
    context,
    dependencyKey: keyof TRegistry,
  ) {
    if (context && context[dependencyKey]) {
      return context[dependencyKey];
    }

    if (registry.declarations.hasKey(dependencyKey)) {
      let declarationResolver: DependencyResolver<any, any> = registry.declarations.get(dependencyKey);
      return declarationResolver.build(registry, context, cache);
    }

    if (registry.imports.hasKey(dependencyKey)) {
      let childModule = unwrapThunk(registry.imports.get(dependencyKey));
      return proxyGetter(childModule, cache, context);
    }

    throw new Error(`Cannot find dependency for ${dependencyKey} key`);
  },

  init(registry: DefinitionsSet<any>, cache: ContainerCache, context) {
    registry.forEachModule(registry => {
      if (cache.isModuleInitialized(registry.moduleId)) {
        return;
      }

      // const moduleContainer = new Container(registry, cache);
      registry.initializers.forEach(initializers =>
        initializers.forEach(init => {
          init(proxyGetter(registry, cache, context));
        }),
      );
      cache.markModuleAsInitialized(registry.moduleId);
    });
  },
};
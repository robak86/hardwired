import { Module } from '../resolvers/abstract/Module';
import { ModulePatch } from '../resolvers/abstract/ModulePatch';
import { SingletonScope } from './SingletonScope';
import { reducePatches } from '../module/utils/reducePatches';
import { getPatchesDefinitionsIds } from '../module/utils/getPatchesDefinitionsIds';
import { ContainerScopeOptions } from './Container';
import { ContextService } from './ContextService';

export type ContainerContext = {
  resolversById: Record<string, Module.InstanceDefinition>;
  resolversByModuleIdAndPath: Record<string, Module.InstanceDefinition>;
  modulesByResolverId: Record<string, Module<any>>;
  materializedObjects: Record<string, any>;
  globalScope: SingletonScope; // TODO: probably we shouldn't allow for such complex scopes rules (this feature may be harmful)
  hierarchicalScope: Record<string, any>;
  loadedModules: Record<string, Module<any>>;
  requestScope: Record<string, any>;
};

// TODO: do not deep copy - implement copy on write strategy
export const ContainerContext = {
  checkoutRequestScope(prevContext: ContainerContext): ContainerContext {
    return {
      resolversById: prevContext.resolversById,
      modulesByResolverId: prevContext.modulesByResolverId,
      resolversByModuleIdAndPath: prevContext.resolversByModuleIdAndPath,
      globalScope: prevContext.globalScope,
      hierarchicalScope: prevContext.hierarchicalScope,
      loadedModules: prevContext.loadedModules,
      requestScope: {},
      materializedObjects: {},
    };
  },

  childScope(options: ContainerScopeOptions, prevContext: ContainerContext): ContainerContext {
    const { overrides = [], eager = [] } = options;
    const childScopePatches = reducePatches(overrides, prevContext.loadedModules);
    const ownKeys = getPatchesDefinitionsIds(childScopePatches);

    // TODO: possible optimizations if patches array is empty ? beware to not mutate parent scope

    const context = {
      resolversById: {},
      requestScope: {},
      modulesByResolverId: {},
      materializedObjects: {},
      resolversByModuleIdAndPath: {},
      hierarchicalScope: {},
      globalScope: prevContext.globalScope.checkoutChild(ownKeys),
      loadedModules: childScopePatches,
    };

    // TODO: this should be atomic with assigning loadedModules property
    ContextService.loadModules(Object.values(childScopePatches), context);

    return context;
  },

  empty() {
    return ContainerContext.create([]);
  },

  create(overrides: ModulePatch<any>[]): ContainerContext {
    const reducedOverrides = reducePatches(overrides);
    const ownKeys = getPatchesDefinitionsIds(reducedOverrides);

    const context = {
      resolversById: {},
      requestScope: {},
      modulesByResolverId: {},
      materializedObjects: {},
      resolversByModuleIdAndPath: {},
      globalScope: new SingletonScope(ownKeys),
      hierarchicalScope: {},
      loadedModules: reducedOverrides,
    };

    // TODO: this should be atomic with assigning loadedModules property
    ContextService.loadModules(Object.values(reducedOverrides), context);

    return context;
  },
};

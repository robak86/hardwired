import { ContainerContext } from './ContainerContext';
import { ContainerScopeOptions } from '../container/Container';
import { reducePatches } from '../module/utils/reducePatches';
import { getPatchesDefinitionsIds } from '../module/utils/getPatchesDefinitionsIds';
import { ContextService } from './ContextService';

export const ContextScopes = {
  checkoutRequestScope(prevContext: ContainerContext): ContainerContext {
    return {
      resolversById: prevContext.resolversById,
      modulesByResolverId: prevContext.modulesByResolverId,
      resolversByModuleIdAndPath: prevContext.resolversByModuleIdAndPath,
      globalScope: prevContext.globalScope,
      hierarchicalScope: prevContext.hierarchicalScope,
      loadedModules: prevContext.loadedModules,
      frozenOverrides: prevContext.frozenOverrides,
      requestScope: {},
      materializedObjects: {},
    };
  },

  childScope(options: ContainerScopeOptions, prevContext: ContainerContext): ContainerContext {
    const { invariants = [], eager = [] } = options;
    const childScopePatches = reducePatches(invariants, prevContext.loadedModules);
    const ownKeys = getPatchesDefinitionsIds(childScopePatches);

    // TODO: possible optimizations if patches array is empty ? beware to not mutate parent scope

    const context = {
      resolversById: {},
      requestScope: {},
      modulesByResolverId: {},
      materializedObjects: {},
      resolversByModuleIdAndPath: {},
      hierarchicalScope: {},
      frozenOverrides: prevContext.frozenOverrides,
      globalScope: prevContext.globalScope.checkoutChild(ownKeys),
      loadedModules: childScopePatches,
    };

    ContextService.loadModules(Object.values(childScopePatches), context);

    return context;
  },
};

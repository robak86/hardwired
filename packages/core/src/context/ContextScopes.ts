import { ContainerContext } from './ContainerContext';
import { ContainerScopeOptions } from '../container/Container';
import { ContextService } from './ContextService';
import { ModulePatch } from '../module/ModulePatch';

export function getPatchedResolversIds(loadTarget: ModulePatch<any>[]) {
  return loadTarget.flatMap(m => {
    return m.patchedResolvers.values.map(patchedResolver => {
      return patchedResolver.id;
    });
  });
}

export const ContextScopes = {
  checkoutRequestScope(prevContext: ContainerContext): ContainerContext {
    return {
      resolversById: prevContext.resolversById,
      patchedResolversById: prevContext.patchedResolversById,
      modulesByResolverId: prevContext.modulesByResolverId,
      globalScope: prevContext.globalScope,
      hierarchicalScope: prevContext.hierarchicalScope,
      frozenOverrides: prevContext.frozenOverrides,
      requestScope: {},
      materializedObjects: {},
    };
  },

  childScope(options: ContainerScopeOptions, prevContext: ContainerContext): ContainerContext {
    const { invariants = [], eager = [] } = options;
    const loadTarget = [...invariants, ...eager];
    const ownOverrides = getPatchedResolversIds(loadTarget);

    // TODO: possible optimizations if patches array is empty ? beware to not mutate parent scope

    const context = {
      requestScope: {},
      materializedObjects: {},
      resolversByModuleIdAndPath: {},
      hierarchicalScope: {},
      resolversById: { ...prevContext.resolversById }, // TODO: introduce separate property for storing patchedResolvers (it will have less items, so copying whole object should be faster)
      patchedResolversById: { ...prevContext.patchedResolversById },
      modulesByResolverId: prevContext.modulesByResolverId,
      frozenOverrides: prevContext.frozenOverrides,
      globalScope: prevContext.globalScope.checkoutChild(ownOverrides),
    };

    ContextService.loadPatches(loadTarget, context);

    return context;
  },
};

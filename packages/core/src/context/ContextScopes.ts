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
      invariantResolversById: prevContext.invariantResolversById,
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
    const { overrides = [], eager = [] } = options;
    const loadTarget = [...overrides, ...eager];
    const ownOverrides = getPatchedResolversIds(loadTarget);

    // TODO: possible optimizations if patches array is empty ? beware to not mutate parent scope

    const context: ContainerContext = {
      requestScope: {},
      materializedObjects: {},
      hierarchicalScope: {},
      resolversById: prevContext.resolversById,
      invariantResolversById: prevContext.invariantResolversById,
      patchedResolversById: { ...prevContext.patchedResolversById },
      modulesByResolverId: prevContext.modulesByResolverId,
      frozenOverrides: prevContext.frozenOverrides,
      globalScope: prevContext.globalScope.checkoutChild(ownOverrides),
    };

    ContextService.loadPatches(loadTarget, context);

    return context;
  },
};

import { ContainerContext } from './ContainerContext';
import { ContainerScopeOptions } from '../container/Container';
import { ContextService } from './ContextService';
import { ModulePatch } from '../module/ModulePatch';
import { createContainerId } from '../utils/fastId';

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
      id: createContainerId(), // TODO: add composite id - rootId-requestId-scopeId
      resolversById: prevContext.resolversById,
      invariantResolversById: prevContext.invariantResolversById,
      patchedResolversById: prevContext.patchedResolversById,
      modulesByResolverId: prevContext.modulesByResolverId,
      globalScope: prevContext.globalScope,
      currentScope: prevContext.currentScope,
      frozenOverrides: prevContext.frozenOverrides,
      requestScope: {},
      materializedObjects: {},
    };
  },

  childScope(options: ContainerScopeOptions, prevContext: ContainerContext): ContainerContext {
    const { scopeOverrides = [], eager = [] } = options;
    const loadTarget = [...scopeOverrides, ...eager];
    const ownOverrides = getPatchedResolversIds(loadTarget);

    // TODO: possible optimizations if patches array is empty ? beware to not mutate parent scope

    const context: ContainerContext = {
      id: createContainerId(),
      resolversById: prevContext.resolversById,
      invariantResolversById: prevContext.invariantResolversById,
      patchedResolversById: { ...prevContext.patchedResolversById },
      modulesByResolverId: prevContext.modulesByResolverId,
      frozenOverrides: prevContext.frozenOverrides,
      globalScope: prevContext.globalScope.checkoutChild(ownOverrides),
      requestScope: {},
      materializedObjects: {},
      currentScope: {}, // scope created by by checkoutChildScope -
    };

    ContextService.loadPatches(loadTarget, context);

    return context;
  },
};

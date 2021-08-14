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
  // checkoutRequestScope(prevContext: ContainerContext): ContainerContext {
  //   return {
  //     id: createContainerId(), // TODO: add composite id - rootId-requestId-scopeId
  //     resolversById: prevContext.resolversById,
  //     globalOverrideResolversById: prevContext.globalOverrideResolversById,
  //     patchedResolversById: prevContext.patchedResolversById,
  //     modulesByResolverId: prevContext.modulesByResolverId,
  //     globalOverridesScope: prevContext.globalOverridesScope,
  //     globalScope: prevContext.globalScope,
  //     currentScope: prevContext.currentScope,
  //     requestScope: {},
  //
  //     materializedObjects: {}, //TODO: this looks like kind of cache that does not to have belong to context?
  //   };
  // },
  //
  // childScope(options: Omit<ContainerScopeOptions, 'globalOverrides'>, prevContext: ContainerContext): ContainerContext {
  //   const { scopeOverrides = [], eager = [] } = options;
  //   const loadTarget = [...scopeOverrides, ...eager];
  //   const ownOverrides = getPatchedResolversIds(loadTarget);
  //
  //   // TODO: possible optimizations if patches array is empty ? beware to not mutate parent scope
  //
  //   const context: ContainerContext = {
  //     id: createContainerId(),
  //     resolversById: prevContext.resolversById,
  //     globalOverrideResolversById: prevContext.globalOverrideResolversById,
  //     patchedResolversById: { ...prevContext.patchedResolversById },
  //     modulesByResolverId: prevContext.modulesByResolverId,
  //     globalOverridesScope: prevContext.globalOverridesScope,
  //     globalScope: prevContext.globalScope.checkoutChild(ownOverrides),
  //     currentScope: {}, // TODO: here we need to rw
  //     requestScope: {},
  //
  //     materializedObjects: {},
  //   };
  //
  //   ContextService.loadPatches(loadTarget, context);
  //
  //   return context;
  // },
};

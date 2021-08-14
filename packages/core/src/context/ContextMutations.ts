import { ContainerContext } from './ContainerContext';
import { Module } from '../module/Module';
import invariant from 'tiny-invariant';

export const ContextMutations = {
  setForRequestScope(uuid: string, instance: any, context: ContainerContext): void {
    context.requestScope[uuid] = instance;
  },

  setForHierarchicalScope(id: string, instanceOrStrategy: any, context: ContainerContext) {
    context.currentScope[id] = instanceOrStrategy;
  },

  setForGlobalScope(uuid: string, instance: any, context: ContainerContext) {
    context.globalScope.set(uuid, instance);
  },

  addPatchedResolver(module: Module<any>, resolver: Module.InstanceDefinition, context: ContainerContext) {
    context.patchedResolversById[resolver.id] = resolver;
    context.modulesByResolverId[resolver.id] = module;
  },

  addGlobalOverrideResolver(module: Module<any>, resolver: Module.InstanceDefinition, context: ContainerContext) {
    invariant(
      !context.globalOverrideResolversById[resolver.id],
      `Invariant resolves cannot be updated after container creation`,
    );
    context.globalOverrideResolversById[resolver.id] = resolver;
    context.modulesByResolverId[resolver.id] = module;
  },

  addResolver(module: Module<any>, path: string, resolver: Module.InstanceDefinition, context: ContainerContext) {
    invariant(
      !context.resolversById[resolver.id],
      `Cannot add resolver. Resolver with id=${resolver.id} for path=${path} already exists.`,
    );
    context.resolversById[resolver.id] = resolver;
    context.modulesByResolverId[resolver.id] = module;
  },
};

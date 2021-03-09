import { ContainerContext } from './ContainerContext';
import { Module } from '../module/Module';
import invariant from 'tiny-invariant';
import { buildResolverId } from '../module/ModuleBuilder';

export const ContextMutations = {
  setForRequestScope(uuid: string, instance: any, context: ContainerContext): void {
    context.requestScope[uuid] = instance;
  },

  setForHierarchicalScope(id: string, instanceOrStrategy: any, context: ContainerContext) {
    context.hierarchicalScope[id] = instanceOrStrategy;
  },

  setForGlobalScope(uuid: string, instance: any, context: ContainerContext) {
    context.globalScope.set(uuid, instance);
  },

  addPatchedResolver(
    module: Module<any>,
    resolver: Module.InstanceDefinition,
    context: ContainerContext,
  ) {
    context.resolversById[resolver.id] = resolver;
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

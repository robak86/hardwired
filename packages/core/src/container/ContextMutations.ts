import { ContextRecord } from './ContainerContextStorage';
import { Module } from '../resolvers/abstract/Module';
import invariant from 'tiny-invariant';

export const ContextMutations = {
  setForRequestScope(uuid: string, instance: any, context: ContextRecord): void {
    context.requestScope[uuid] = instance;
  },

  setForHierarchicalScope(id: string, instanceOrStrategy: any, context: ContextRecord) {
    context.hierarchicalScope[id] = instanceOrStrategy;
  },

  setForGlobalScope(uuid: string, instance: any, context: ContextRecord) {
    context.globalScope.set(uuid, instance);
  },

  addResolver(module: Module<any>, path: string, resolver: Module.InstanceDefinition, context: ContextRecord) {
    const { moduleId } = module;
    invariant(
      !context.resolversById[resolver.id],
      `Cannot add resolver. Resolver with id=${resolver.id} for path=${path} already exists.`,
    );
    context.resolversById[resolver.id] = resolver;
    context.modulesByResolverId[resolver.id] = module;
    context.resolversByModuleIdAndPath[moduleId.id + path] = resolver;
  },
};

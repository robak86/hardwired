import { ContainerContext } from './ContainerContext';
import invariant from 'tiny-invariant';
import { isInstanceDefinition, Module } from '../module/Module';
import { ModuleId } from '../module/ModuleId';

export const ContextLookup = {
  hasInHierarchicalScope(id: string, context: ContainerContext) {
    return !!context.hierarchicalScope[id];
  },

  getFromHierarchicalScope(id: string, context: ContainerContext) {
    return context.hierarchicalScope[id];
  },

  hasInRequestScope(uuid: string, context: ContainerContext): boolean {
    return !!context.requestScope[uuid];
  },

  hasInGlobalScope(uuid: string, context: ContainerContext): boolean {
    return context.globalScope.has(uuid);
  },

  getFromRequestScope(uuid: string, context: ContainerContext) {
    invariant(!!context.requestScope[uuid], `Dependency with given uuid doesn't exists in request scope`);
    return context.requestScope[uuid];
  },

  getFromGlobalScope(uuid: string, context: ContainerContext) {
    invariant(!!context.globalScope.has(uuid), `Dependency with given uuid doesn't exists in global scope`);
    return context.globalScope.get(uuid);
  },

  hasResolver(resolver: Module.InstanceDefinition, context: ContainerContext): boolean {
    return !!context.resolversById[resolver.id];
  },

  hasResolverByModuleAndPath(moduleId: ModuleId, path: string, context: ContainerContext): boolean {
    return !!context.resolversByModuleIdAndPath[moduleId.id + path];
  },

  getResolverByModuleAndPath(moduleId: ModuleId, path: string, context: ContainerContext) {
    const resolver = context.resolversByModuleIdAndPath[moduleId.id + path];
    invariant(resolver, `Cannot get resolver for moduleId = ${moduleId} and path ${path}`);
    return resolver;
  },

  getModuleForResolverByResolverId(resolverId: string, context: ContainerContext): Module<any> {
    const module = context.modulesByResolverId[resolverId];
    invariant(module, `Cannot find module for resolverId=${resolverId}`);
    return module;
  },

  filterLoadedDefinitions(
    predicate: (resolver: Module.InstanceDefinition) => boolean,
    context: ContainerContext,
  ): Module.InstanceDefinition[] {
    return Object.keys(context.loadedModules).flatMap(moduleId => {
      const module = context.loadedModules[moduleId];
      const definitions = module.registry.values;

      return definitions.filter(definition => {
        return isInstanceDefinition(definition) && predicate(definition);
      }) as Module.InstanceDefinition[];
    });
  },
};

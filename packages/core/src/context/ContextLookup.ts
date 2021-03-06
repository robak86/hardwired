import { ContainerContext } from './ContainerContext';
import invariant from 'tiny-invariant';
import { Module } from '../module/Module';
import { ModuleId } from '../module/ModuleId';
import { buildResolverId } from '../module/ModuleBuilder';

export const ContextLookup = {
  hasInCurrentScope(id: string, context: ContainerContext) {
    return !!context.currentScope[id];
  },

  getFromCurrentScope(id: string, context: ContainerContext) {
    return context.currentScope[id];
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
    return !!context.resolversById[buildResolverId({ moduleId }, path)];
  },

  hasInvariantResolver(moduleId: ModuleId, path: string, context: ContainerContext): boolean {
    return !!context.invariantResolversById[buildResolverId({ moduleId }, path)];
  },

  hasPatchedResolver(moduleId: ModuleId, path: string, context: ContainerContext): boolean {
    return !!context.patchedResolversById[buildResolverId({ moduleId }, path)];
  },

  getPatchedResolver(moduleId: ModuleId, path: string, context: ContainerContext) {
    const resolver = context.patchedResolversById[buildResolverId({ moduleId }, path)];
    invariant(resolver, `Cannot get resolver for moduleId = ${JSON.stringify(moduleId.id)} and path ${path}`);
    return resolver;
  },

  getResolverByModuleAndPath(moduleId: ModuleId, path: string, context: ContainerContext) {
    const resolver = context.resolversById[buildResolverId({ moduleId }, path)];
    invariant(resolver, `Cannot get resolver for moduleId = ${JSON.stringify(moduleId.id)} and path ${path}`);
    return resolver;
  },

  getInvariantResolverByModuleAndPath(moduleId: ModuleId, path: string, context: ContainerContext) {
    const resolver = context.invariantResolversById[buildResolverId({ moduleId }, path)];
    invariant(resolver, `Cannot get invariant resolver for moduleId = ${JSON.stringify(moduleId.id)} and path ${path}`);
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
    return Object.values({ ...context.resolversById, ...context.patchedResolversById }).filter(definition => {
      return predicate(definition);
    });
  },
};

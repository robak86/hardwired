import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';
import { Module } from '../module/Module';

export class ResolversLookup {
  private resolversById: Record<string, Module.InstanceDefinition> = {};
  private resolversByModuleIdAndPath: Record<string, Module.InstanceDefinition> = {};
  private modulesByResolverId: Record<string, Module<any>> = {};

  has(resolver: Module.InstanceDefinition): boolean {
    return !!this.resolversById[resolver.id];
  }

  add(module: Module<any>, path: string, resolver: Module.InstanceDefinition) {
    const { moduleId } = module;
    this.resolversById[resolver.id] = resolver;
    this.modulesByResolverId[resolver.id] = module;
    this.resolversByModuleIdAndPath[moduleId.id + path] = resolver;
  }

  getModuleForResolver(resolverId: string): Module<any> {
    return this.modulesByResolverId[resolverId];
  }

  getByModule(moduleId: ModuleId, path: string): Module.InstanceDefinition {
    const resolver = this.resolversByModuleIdAndPath[moduleId.id + path];
    invariant(resolver, `Cannot get resolver for moduleId ${moduleId} and path ${path}`);
    return resolver;
  }

  hasByModule(moduleId: ModuleId, path: string): boolean {
    return !!this.resolversByModuleIdAndPath[moduleId.id + path];
  }
}

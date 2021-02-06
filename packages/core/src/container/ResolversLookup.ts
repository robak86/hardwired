import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';
import { Module } from '../resolvers/abstract/Module';

export class ResolversLookup {
  private resolversById: Record<string, Module.BoundInstance> = {};
  private resolversByModuleIdAndPath: Record<string, Module.BoundInstance> = {};
  private modulesByResolverId: Record<string, Module<any>> = {};

  has(resolver: Module.BoundInstance): boolean {
    return !!this.resolversById[resolver.id];
  }

  add(module: Module<any>, path: string, resolver: Module.BoundInstance) {
    const { moduleId } = module;
    this.resolversById[resolver.id] = resolver;
    this.modulesByResolverId[resolver.id] = module;
    this.resolversByModuleIdAndPath[moduleId.revision + path] = resolver;
  }

  getModuleForResolver(resolverId: string): Module<any> {
    return this.modulesByResolverId[resolverId];
  }

  getByModule(moduleId: ModuleId, path: string): Module.BoundInstance {
    const resolver = this.resolversByModuleIdAndPath[moduleId.revision + path];
    invariant(resolver, `Cannot get resolver for moduleId ${moduleId} and path ${path}`);
    return resolver;
  }

  hasByModule(moduleId: ModuleId, path: string): boolean {
    return !!this.resolversByModuleIdAndPath[moduleId.revision + path];
  }
}

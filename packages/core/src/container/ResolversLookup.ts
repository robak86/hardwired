import { Instance } from '../resolvers/abstract/Instance';
import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';
import { Module } from '../resolvers/abstract/Module';

export class ResolversLookup {
  private resolversById: Record<string, Instance<any>> = {};
  private resolversByModuleIdAndPath: Record<string, Instance<any>> = {};
  private modulesByResolverId: Record<string, Module<any>> = {};

  has(resolver: Instance<any>): boolean {
    return !!this.resolversById[resolver.id];
  }

  add(module: Module<any>, path: string, resolver: Instance<any>) {
    const { moduleId } = module;
    this.resolversById[resolver.id] = resolver;
    this.modulesByResolverId[resolver.id] = module;
    this.resolversByModuleIdAndPath[moduleId.id + path] = resolver;
  }

  getModuleForResolver(resolverId: string): Module<any> {
    return this.modulesByResolverId[resolverId];
  }

  getByModule(moduleId: ModuleId, path: string): Instance<any> {
    const resolver = this.resolversByModuleIdAndPath[moduleId.id + path];
    invariant(resolver, `Cannot get resolver for moduleId ${moduleId} and path ${path}`);
    return resolver;
  }

  hasByModule(moduleId: ModuleId, path: string): boolean {
    return !!this.resolversByModuleIdAndPath[moduleId.id + path];
  }
}

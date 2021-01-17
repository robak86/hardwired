import { Instance } from '../resolvers/abstract/Instance';
import { ClassType } from '../utils/ClassType';
import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';

export class ResolversLookup {
  private resolversById: Record<string, Instance<any, any>> = {};
  private resolversByModuleIdAndPath: Record<string, Instance<any, any>> = {};

  has(resolver: Instance<any, any>): boolean {
    return !!this.resolversById[resolver.id];
  }

  add(moduleId: ModuleId, path: string, resolver: Instance<any, any>) {
    this.resolversById[resolver.id] = resolver;
    this.resolversByModuleIdAndPath[moduleId.id + path] = resolver;
  }

  getByModule(moduleId: ModuleId, path: string): Instance<any, any> {
    const resolver = this.resolversByModuleIdAndPath[moduleId.id + path];
    invariant(resolver, `Cannot get resolver for moduleId ${moduleId} and path ${path}`);
    return resolver;
  }

  hasByModule(moduleId: ModuleId, path: string): boolean {
    return !!this.resolversByModuleIdAndPath[moduleId.id + path];
  }

  filterByType<TResolverClass extends Instance<any, any>>(
    resolverClass: ClassType<TResolverClass, any>,
  ): TResolverClass[] {
    return Object.values(this.resolversById).filter(resolver => resolver instanceof resolverClass) as any;
  }
}

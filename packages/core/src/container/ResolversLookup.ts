import { Instance } from '../resolvers/abstract/Instance';
import { ClassType } from '../utils/ClassType';

export class ResolversLookup {
  private resolversById: Record<string, Instance<any, any>> = {};

  add(resolver: Instance<any, any>) {
    this.resolversById[resolver.id] = resolver;
  }

  filterByType<TResolverClass extends Instance<any, any>>(
    resolverClass: ClassType<TResolverClass, any>,
  ): TResolverClass[] {
    return Object.values(this.resolversById).filter(resolver => resolver instanceof resolverClass) as any;
  }
}

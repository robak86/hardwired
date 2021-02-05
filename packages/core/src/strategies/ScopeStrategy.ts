import { ContainerContext } from '../container/ContainerContext';
import { BuildStrategy } from './abstract/BuildStrategy';
import { Instance } from '../resolvers/abstract/Instance';

export class ScopeStrategy<TValue> extends BuildStrategy<TValue> {
  build(id: string, context: ContainerContext, materializedModule): TValue {
    if (context.hasInHierarchicalScope(id)) {
      return context.getFromHierarchicalScope(id);
    } else {
      const instanceOrStrategy = this.buildFunction(materializedModule);

      if (instanceOrStrategy instanceof Instance) {
        return instanceOrStrategy.build(id, context, materializedModule);
      }

      context.setForHierarchicalScope(id, instanceOrStrategy);
      return instanceOrStrategy;
    }
  }
}

export const scoped = <TReturn>(buildFunction: (ctx) => TReturn) => {
  return new ScopeStrategy(buildFunction);
};

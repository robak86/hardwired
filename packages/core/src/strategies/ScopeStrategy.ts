import { ContainerContext } from '../container/ContainerContext';
import { BuildStrategy } from './abstract/BuildStrategy';

export class ScopeStrategy<TValue> extends BuildStrategy<TValue> {
  build(id: string, context: ContainerContext, materializedModule): TValue {
    if (context.hasInHierarchicalScope(id)) {
      return context.getFromHierarchicalScope(id);
    } else {
      const instance = this.buildFunction(materializedModule);
      context.setForHierarchicalScope(id, instance);
      return instance;
    }
  }
}

export const scoped = <TReturn>(buildFunction: (ctx) => TReturn) => {
  return new ScopeStrategy(buildFunction);
};

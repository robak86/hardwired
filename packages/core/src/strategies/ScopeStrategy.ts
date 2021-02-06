import { ContainerContext } from '../container/ContainerContext';
import { BuildStrategy } from './abstract/BuildStrategy';
import { buildTaggedStrategy } from './utils/strategyTagging';

export class ScopeStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = scopeStrategyTag;

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

const scopeStrategyTag = Symbol();

export const scoped = buildTaggedStrategy(
  <TReturn>(buildFunction: (ctx) => TReturn) => new ScopeStrategy(buildFunction),
  scopeStrategyTag,
);

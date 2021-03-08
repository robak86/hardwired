import { BuildStrategy } from './abstract/BuildStrategy';
import { buildTaggedStrategy } from './utils/strategyTagging';
import { ContainerContext } from '../context/ContainerContext';
import { ContextLookup } from '../context/ContextLookup';
import { ContextMutations } from '../context/ContextMutations';

export class ScopeStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = scopeStrategyTag;

  build(id: string, context: ContainerContext, materializedModule): TValue {
    if (ContextLookup.hasInHierarchicalScope(id, context)) {
      return ContextLookup.getFromHierarchicalScope(id, context);
    } else {
      const instance = this.buildFunction(materializedModule);
      ContextMutations.setForHierarchicalScope(id, instance, context);
      return instance;
    }
  }
}

const scopeStrategyTag = Symbol();

export const scoped = buildTaggedStrategy(
  <TReturn>(buildFunction: (ctx) => TReturn) => new ScopeStrategy(buildFunction),
  scopeStrategyTag,
);

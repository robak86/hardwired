import { buildTaggedStrategy } from './utils/strategyTagging';
import { ContainerContext } from '../context/ContainerContext';
import { ContextLookup } from '../context/ContextLookup';
import { ContextMutations } from '../context/ContextMutations';
import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';

export class ScopeStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = scopeStrategyTag;

  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }

  build(id: string, context: ContainerContext, materializedModule): TValue {
    if (ContextLookup.hasInCurrentScope(id, context)) {
      return ContextLookup.getFromCurrentScope(id, context);
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

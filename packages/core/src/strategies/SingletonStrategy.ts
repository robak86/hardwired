import { buildTaggedStrategy } from './utils/strategyTagging';
import { ContainerContext } from '../context/ContainerContext';
import { ContextLookup } from '../context/ContextLookup';
import { ContextMutations } from '../context/ContextMutations';
import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';

export class SingletonStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = singletonStrategyTag;

  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }

  build(id: string, context: ContainerContext, materializedModule): TValue {
    if (ContextLookup.hasInGlobalScope(id, context)) {
      return ContextLookup.getFromGlobalScope(id, context);
    } else {
      const instance = this.buildFunction(materializedModule);
      ContextMutations.setForGlobalScope(id, instance, context);
      return instance;
    }
  }
}

export const singletonStrategyTag = Symbol();

export const singleton = buildTaggedStrategy(
  <TReturn>(buildFunction: (ctx) => TReturn) => new SingletonStrategy(buildFunction),
  singletonStrategyTag,
);

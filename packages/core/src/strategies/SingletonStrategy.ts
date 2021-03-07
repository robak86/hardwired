import { BuildStrategy } from './abstract/BuildStrategy';
import { buildTaggedStrategy } from './utils/strategyTagging';
import { ContextRecord } from '../container/ContainerContextStorage';
import { ContextLookup } from '../container/ContextLookup';
import { ContextMutations } from '../container/ContextMutations';

export class SingletonStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = singletonStrategyTag;

  build(id: string, context: ContextRecord, materializedModule): TValue {
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

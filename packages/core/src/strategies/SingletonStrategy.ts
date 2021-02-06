import { ContainerContext } from '../container/ContainerContext';
import { BuildStrategy } from './abstract/BuildStrategy';
import { buildTaggedStrategy } from './utils/strategyTagging';

export class SingletonStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = singletonStrategyTag;

  build(id: string, context: ContainerContext, materializedModule): TValue {
    if (context.hasInGlobalScope(id)) {
      return context.getFromGlobalScope(id);
    } else {
      const instance = this.buildFunction(materializedModule);
      context.setForGlobalScope(id, instance);
      return instance;
    }
  }
}

export const singletonStrategyTag = Symbol();

export const singleton = buildTaggedStrategy(
  <TReturn>(buildFunction: (ctx) => TReturn) => new SingletonStrategy(buildFunction),
  singletonStrategyTag,
);

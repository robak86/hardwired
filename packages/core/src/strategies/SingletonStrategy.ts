import { buildTaggedStrategy } from './utils/strategyTagging';
import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';

export class SingletonStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = singletonStrategyTag;

  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }

  build(id: string, context: InstancesCache, materializedModule?): TValue {
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

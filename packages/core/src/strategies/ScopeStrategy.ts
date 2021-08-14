import { buildTaggedStrategy } from './utils/strategyTagging';
import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';

export class ScopeStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = scopeStrategyTag;

  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }

  build(id: string, instancesCache: InstancesCache, materializedModule?): TValue {
    if (instancesCache.hasInCurrentScope(id)) {
      return instancesCache.getFromCurrentScope(id);
    } else {
      const instance = this.buildFunction(materializedModule);
      instancesCache.setForHierarchicalScope(id, instance);
      return instance;
    }
  }
}

const scopeStrategyTag = Symbol();

export const scoped = buildTaggedStrategy(
  <TReturn>(buildFunction: (ctx) => TReturn) => new ScopeStrategy(buildFunction),
  scopeStrategyTag,
);

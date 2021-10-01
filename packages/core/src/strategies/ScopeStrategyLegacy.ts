import { InstancesCache } from '../context/InstancesCache';
import { BuildStrategy } from './abstract/BuildStrategy';

export class ScopeStrategyLegacy<TValue> extends BuildStrategy<TValue> {
  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }

  build(id: string, instancesCache: InstancesCache, resolvers, materializedModule?): TValue {
    if (resolvers.hasGlobalOverrideResolver(id)) {
      if (instancesCache.hasInGlobalOverride(id)) {
        return instancesCache.getFromGlobalOverride(id);
      } else {
        const instance = this.buildFunction(materializedModule);
        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    if (instancesCache.hasInCurrentScope(id)) {
      return instancesCache.getFromCurrentScope(id);
    } else {
      const instance = this.buildFunction(materializedModule);
      instancesCache.setForHierarchicalScope(id, instance);
      return instance;
    }
  }
}

export const scoped = <TReturn>(buildFunction: (ctx) => TReturn) => new ScopeStrategyLegacy(buildFunction);

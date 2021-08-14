import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';

export class ScopeStrategy<TValue> extends BuildStrategy<TValue> {
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

export const scoped = <TReturn>(buildFunction: (ctx) => TReturn) => new ScopeStrategy(buildFunction);

import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';

export class ScopeStrategy<TValue> extends BuildStrategy<TValue> {

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

export const scoped = <TReturn>(buildFunction: (ctx) => TReturn) => new ScopeStrategy(buildFunction);

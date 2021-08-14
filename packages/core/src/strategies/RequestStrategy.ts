import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';

export class RequestStrategy<TValue> extends BuildStrategy<TValue> {
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

    if (instancesCache.hasInRequestScope(id)) {
      return instancesCache.getFromRequestScope(id);
    } else {
      const instance = this.buildFunction(materializedModule);
      instancesCache.setForRequestScope(id, instance);
      return instance;
    }
  }
}

export const request = <TReturn>(buildFunction: (ctx) => TReturn) => new RequestStrategy(buildFunction);

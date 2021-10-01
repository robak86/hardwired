import { InstancesCache } from '../context/InstancesCache';
import { BuildStrategy } from './abstract/BuildStrategy';

export class TransientStrategyLegacy<TValue> extends BuildStrategy<TValue> {
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

    const result = this.buildFunction(materializedModule);
    if (result instanceof BuildStrategy) {
      return result.build(id, instancesCache, materializedModule);
    }
    return result;
  }
}

export const transient = <TReturn>(buildFunction: (ctx) => TReturn) => new TransientStrategyLegacy(buildFunction);

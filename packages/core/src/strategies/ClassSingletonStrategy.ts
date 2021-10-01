import { BuildStrategyNew, StrategiesRegistry } from './abstract/_BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { InstanceEntry } from '../new/InstanceEntry';

export class ClassSingletonStrategy extends BuildStrategyNew {
  static type = Symbol.for('classSingleton');

  build(
    definition: InstanceEntry<any>,
    instancesCache: InstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      if (instancesCache.hasInGlobalOverride(id)) {
        return instancesCache.getFromGlobalOverride(id);
      } else {
        const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);
        const instance = new definition.target(...dependencies);
        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    if (instancesCache.hasInGlobalScope(id)) {
      return instancesCache.getFromGlobalScope(id);
    } else {
      const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);
      const instance = new definition.target(...dependencies);
      instancesCache.setForGlobalScope(id, instance);
      return instance;
    }
  }
}

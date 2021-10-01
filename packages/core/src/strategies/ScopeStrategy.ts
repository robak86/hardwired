import { BuildStrategyNew, StrategiesRegistry } from './abstract/_BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { createInstance, InstanceEntry } from '../new/InstanceEntry';

export class ScopeStrategy extends BuildStrategyNew {
  static type = Symbol.for('scope');

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
        const instance = createInstance(definition, dependencies);
        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    if (instancesCache.hasInCurrentScope(id)) {
      return instancesCache.getFromCurrentScope(id);
    } else {
      const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);
      const instance = createInstance(definition, dependencies);
      instancesCache.setForHierarchicalScope(id, instance);
      return instance;
    }
  }
}

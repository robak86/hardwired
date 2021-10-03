import { buildDependencies, BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { createInstance, InstanceDefinition } from './abstract/InstanceDefinition';
import { StrategiesRegistry } from './collection/StrategiesRegistry';

export class ScopeStrategy extends BuildStrategy {
  static type = Symbol.for('scope');

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      if (instancesCache.hasInGlobalOverride(id)) {
        return instancesCache.getFromGlobalOverride(id);
      } else {
        const dependencies = buildDependencies(definition, instancesCache, resolvers, strategiesRegistry); // TODO: these two lines almost always comes together - extract into common function. This will solve issue with decorator
        const instance = createInstance(definition, dependencies);
        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    if (instancesCache.hasInCurrentScope(id)) {
      return instancesCache.getFromCurrentScope(id);
    } else {
      const dependencies = buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);
      const instance = createInstance(definition, dependencies);
      instancesCache.setForHierarchicalScope(id, instance);
      return instance;
    }
  }
}

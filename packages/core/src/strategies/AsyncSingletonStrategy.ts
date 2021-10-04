import { AsyncBuildStrategy, buildAsyncDependencies } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { createInstance } from './abstract/InstanceDefinition';
import { StrategiesRegistry } from './collection/StrategiesRegistry';
import { AnyInstanceDefinition } from './abstract/AnyInstanceDefinition';

export class AsyncSingletonStrategy extends AsyncBuildStrategy {
  static type = Symbol.for('asyncClassSingleton');

  async build(
    definition: AnyInstanceDefinition<any, any, any>,
    instancesCache: InstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      if (instancesCache.hasInGlobalOverride(id)) {
        return instancesCache.getFromGlobalOverride(id);
      } else {
        const dependencies = await buildAsyncDependencies(definition, instancesCache, resolvers, strategiesRegistry);
        const instance = await createInstance(definition, dependencies);

        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    if (instancesCache.hasInGlobalScope(id)) {
      return instancesCache.getFromGlobalScope(id);
    } else {
      const dependencies = await buildAsyncDependencies(definition, instancesCache, resolvers, strategiesRegistry);
      const instance = await createInstance(definition, dependencies);
      instancesCache.setForGlobalScope(id, instance);
      return instance;
    }
  }
}
